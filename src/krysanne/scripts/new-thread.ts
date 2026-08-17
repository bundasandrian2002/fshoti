import { AiResponse } from "@/krysanne/interface";
import TelegramBot, { Message } from "node-telegram-bot-api";

export default async function script(
  api: TelegramBot,
  event: Message,
  body: AiResponse,
) {
  try {
    const nt = await api.createForumTopic(event.chat.id, body.title ?? "New Thread");

    api.sendMessage(event.chat.id, body.message, {
      message_thread_id: nt.message_thread_id,
    });

    api.sendMessage(event.chat.id, body.message, {
      message_thread_id: event.reply_to_message?.message_thread_id,
    });
  } catch (error) {
    // Forum topics only exist in supergroups with Topics enabled — fall
    // back to a plain reply in whichever chat this was invoked from.
    api.sendMessage(event.chat.id, body.message, {
      message_thread_id: event.reply_to_message?.message_thread_id,
    });
  }
}
