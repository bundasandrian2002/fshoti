import { AiResponse } from "@/krysanne/interface";

/**
 * Parses the model's reply into an AiResponse. The system prompt requires
 * plain JSON, but models occasionally wrap it in a ```json ... ``` fence
 * anyway — this strips that if present before parsing. Falls back to
 * treating the whole reply as a plain message (no command) if it isn't
 * valid JSON at all, so a malformed response never crashes the middleware.
 */
export default function mdExtractor(content: string): AiResponse {
  const enclose = /(?:```json\s*)?(\{[\s\S]*?\})(?:\s*```)?$/i;

  if (enclose.test(content)) {
    const body = content.match(enclose)?.[1];
    return JSON.parse(body as string);
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      message: content,
      command: "",
      parameter: "",
    };
  }
}
