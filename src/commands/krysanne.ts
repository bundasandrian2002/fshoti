import { Config, Execute } from "@/types";
import auto from "@/krysanne/middleware/auto";

export const config: Config = {
  name: "krysanne",
  description:
    "Talk to Krysanne, a supportive AI companion — separate from /ai — that can also fetch Bible verses, guitar chords, generate images, and manage forum topics.",
  usage: "/krysanne [message]",
  permission: "user",
  creator: "libyzxy0",
};

export async function execute({ api, event, args }: Execute) {
  const prompt = args.join(" ").trim();
  if (!prompt) {
    await api.sendMessage(event.chat.id, `Usage: ${config.usage}`);
    return false;
  }

  try {
    // auto() sends its own reply (and any script it dispatches sends
    // its own too), so there's nothing further to send from here.
    await auto(api, event, prompt);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    await api.sendMessage(event.chat.id, `❌ Krysanne Error: ${messageText}`);
    return false;
  }
}
