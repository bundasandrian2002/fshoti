/**
 * Krysanne — ported from telegram-ai-main.
 *
 * Every reply from the model is required (by src/krysanne/prompt.md) to be
 * a single JSON object matching this shape. `command` selects which file
 * under src/krysanne/scripts is dispatched next; `parameter` is that
 * script's argument; `title` (only present on the first message of a
 * thread, or when the topic changes) renames the forum topic.
 */
export interface AiResponse {
  message: string;
  command: string;
  parameter: string;
  title?: string;
}
