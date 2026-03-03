import type { ChatMessage } from '@/entities/chat-message';
import type { ConversationMessage } from '@/entities/review';

const EXCLUDED_TYPES = new Set(['loading', 'review-preview']);

export function filterConversationMessages(
  messages: ChatMessage[],
): ConversationMessage[] {
  return messages
    .filter((msg) => !EXCLUDED_TYPES.has(msg.type) && msg.content.trim() !== '')
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
      type: msg.type,
    }));
}
