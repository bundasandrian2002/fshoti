import { AiResponse } from "@/krysanne/interface";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { category, guitar } from "ultimate-guitar";

export default async function script(
  api: TelegramBot,
  event: Message,
  body: AiResponse,
) {
  try {
    const ug = guitar();
    const search = await ug.search(body.parameter, "", category.CHORDS);
    const chords = await ug.fetch(search.responses[0]);

    api.sendMessage(event.chat.id, `${chords.response}`, {
      message_thread_id: event.reply_to_message?.message_thread_id,
    });
  } catch (error) {
    api.sendMessage(
      event.chat.id,
      `❌ Couldn't find chords for "${body.parameter}".`,
      { message_thread_id: event.reply_to_message?.message_thread_id },
    );
  }
}
