import { AiResponse } from "@/krysanne/interface";
import axios from "axios";
import TelegramBot, { Message } from "node-telegram-bot-api";

export default async function script(
  api: TelegramBot,
  event: Message,
  body: AiResponse,
) {
  api.sendMessage(event.chat.id, body.message, {
    message_thread_id: event.reply_to_message?.message_thread_id,
  });

  try {
    const { data } = await axios.post(
      "https://api.lumenfall.ai/openai/v1/images/generations",
      {
        model: "gemini-3.1-flash-lite-image",
        prompt: body.parameter,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.KRYSANNE_IMAGE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    api.sendPhoto(event.chat.id, data.data[0].url, {
      message_thread_id: event.reply_to_message?.message_thread_id,
    });
  } catch (error) {
    api.sendMessage(event.chat.id, "❌ Sorry, the image couldn't be generated.", {
      message_thread_id: event.reply_to_message?.message_thread_id,
    });
  }
}
