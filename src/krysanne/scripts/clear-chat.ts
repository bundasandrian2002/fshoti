import { AiResponse } from "@/krysanne/interface";
import { loadStore, saveStore, storeKey } from "@/krysanne/utils/store";
import TelegramBot, { Message } from "node-telegram-bot-api";

export default async function script(
  api: TelegramBot,
  event: Message,
  body: AiResponse,
) {
  const user = storeKey(event);
  const store = loadStore();
  delete store[user];
  saveStore(store);

  // Forum-topic cleanup only applies when this actually happened inside a
  // topic thread — matches upstream's behaviour, but guarded here so a
  // clear-chat request in an ordinary (non-forum) chat doesn't throw.
  if (event.message_thread_id) {
    try {
      await api.deleteForumTopic(event.chat.id, event.message_thread_id);
    } catch (error) {
      console.error("[Krysanne] Failed to delete forum topic:", error);
    }
  }

  const message = await api.sendMessage(
    event.chat.id,
    event.reply_to_message?.forum_topic_created?.name
      ? `The thread ${event.reply_to_message.forum_topic_created.name} is now deleted.`
      : "This conversation has been cleared.",
  );

  setTimeout(() => {
    api.deleteMessage(message.chat.id, message.message_id).catch(() => {});
  }, 5000);
}
