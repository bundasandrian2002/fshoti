/**
 * Krysanne — ported from telegram-ai-main's src/middleware/auto.ts.
 *
 * This is the companion AI's own turn loop: it is intentionally NOT wired
 * into src/agent or src/utils/agent.ts (the bot's existing Groq-powered
 * tool-using agent behind /ai). Krysanne is a separate assistant with its
 * own model (OpenRouter), its own conversation store, and its own set of
 * script "commands" (src/krysanne/scripts) — the two agents share no code.
 */
import axios from "axios";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { AiResponse } from "@/krysanne/interface";
import mdExtractor from "@/krysanne/utils/md-extractor";
import { loadStore, saveStore, storeKey, ChatMessage } from "@/krysanne/utils/store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// src/krysanne/middleware/auto.ts -> src/krysanne/prompt.md
const PROMPT_PATH = path.join(__dirname, "../prompt.md");
// src/krysanne/middleware/auto.ts -> src/krysanne/scripts
const SCRIPTS_DIR = path.join(__dirname, "../scripts");

export default async function auto(
  api: TelegramBot,
  event: Message,
  body: string,
) {
  const user = storeKey(event);
  const store = loadStore();

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: readFileSync(PROMPT_PATH, "utf-8"),
    },
  ];

  if (event.from?.username) {
    messages.push({
      role: "system",
      content: `The user's Telegram username is: ${event.from.username}`,
    });
  }

  messages.push(...(store[user] ?? []));
  messages.push({ role: "user", content: body });

  const { data } = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "tencent/hy3:free",
      messages,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.KRYSANNE_AI_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  const reply = data.choices[0].message.content as string;
  const extract: AiResponse = mdExtractor(reply);

  messages.push({ role: "assistant", content: reply });
  messages.shift(); // drop the system prompt before persisting
  if (event.from?.username) messages.shift(); // drop the username system note too

  store[user] = messages;
  saveStore(store);

  api.sendChatAction(event.chat.id, "typing", {
    message_thread_id: event.reply_to_message?.message_thread_id,
  });

  const scriptPath = path.join(SCRIPTS_DIR, `${extract.command}.ts`);
  if (extract.command && existsSync(scriptPath)) {
    const { default: script } = await import(pathToFileURL(scriptPath).href);
    await script(api, event, extract);
  } else {
    api.sendMessage(event.chat.id, extract.message, {
      message_thread_id: event.reply_to_message?.message_thread_id,
    });
  }

  if (extract.title && extract.command !== "new-thread") {
    api.editForumTopic(
      event.chat.id,
      event.reply_to_message?.message_thread_id ?? 0,
      { name: extract.title },
    );
  }
}
