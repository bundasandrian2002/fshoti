import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { Message } from "node-telegram-bot-api";

export type ChatMessage = { role: string; content: string };

// Its own filename/directory, separate from anything else this bot stores
// on disk, so Krysanne's conversation history can never collide with
// another feature's data.
const DATA_DIR = path.join(process.cwd(), "data");
const DATASET_PATH = path.join(DATA_DIR, "krysanne-dataset.json");

export function loadStore(): Record<string, ChatMessage[]> {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATASET_PATH)) {
    writeFileSync(DATASET_PATH, "{}", "utf-8");
  }
  return JSON.parse(readFileSync(DATASET_PATH, "utf-8"));
}

export function saveStore(store: Record<string, ChatMessage[]>) {
  writeFileSync(DATASET_PATH, JSON.stringify(store, null, 2), "utf-8");
}

/** Per-user key, suffixed by forum-topic thread id when replying inside one, so each topic keeps its own history. */
export function storeKey(event: Message): string {
  let user = event.from?.id.toString() || event.chat.id.toString();
  if (event.reply_to_message?.message_thread_id) {
    user += `_${event.reply_to_message.message_thread_id}`;
  }
  return user;
}
