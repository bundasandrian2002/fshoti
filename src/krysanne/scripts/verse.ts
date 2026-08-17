import { AiResponse } from "@/krysanne/interface";
import { verse } from "biblegateway-scrape";
import TelegramBot, { Message } from "node-telegram-bot-api";

export default async function script(
  api: TelegramBot,
  event: Message,
  body: AiResponse,
) {
  try {
    const response = await verse(body.parameter);

    api.sendMessage(
      event.chat.id,
      `${body.message}\n\n${response.book}\n${response.verses}`,
      { message_thread_id: event.reply_to_message?.message_thread_id },
    );
  } catch (error) {
    api.sendMessage(
      event.chat.id,
      `❌ Couldn't find "${body.parameter}".`,
      { message_thread_id: event.reply_to_message?.message_thread_id },
    );
  }
}
