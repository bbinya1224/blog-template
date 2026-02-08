/**
 * Chat API
 * SSE 스트리밍 API 호출
 */

import type { ConversationState } from '../model/types';

export interface StreamMessageInput {
  message: string;
  context: {
    step: string;
    userName: string | null;
    collectedInfo: Record<string, unknown>;
    styleProfile: Record<string, unknown> | null;
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: Error) => void;
}

/**
 * SSE 스트리밍으로 메시지 전송
 */
export async function streamChatMessage(
  input: StreamMessageInput,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      callbacks.onError(err);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const err = new Error('No response body');
      callbacks.onError(err);
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let seenDoneEvent = false;
    let seenErrorEvent = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: done')) {
          seenDoneEvent = true;
        } else if (line.startsWith('event: error')) {
          seenErrorEvent = true;
        } else if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (seenDoneEvent) {
              if (data.fullText) {
                callbacks.onDone(data.fullText);
              }
              seenDoneEvent = false;
            } else if (seenErrorEvent) {
              callbacks.onError(new Error(data.message || 'Stream error'));
              seenErrorEvent = false;
            } else if (data.token) {
              callbacks.onToken(data.token);
            }
          } catch {
            // Ignore parse errors for partial data
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer) {
      const lines = buffer.split('\n');
      for (const line of lines) {
        if (line.startsWith('event: done')) {
          seenDoneEvent = true;
        } else if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (seenDoneEvent) {
              if (data.fullText) {
                callbacks.onDone(data.fullText);
              }
              seenDoneEvent = false;
            } else if (data.token) {
              callbacks.onToken(data.token);
            }
          } catch {
            // Ignore
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError(
      error instanceof Error ? error : new Error('Stream error')
    );
  }
}

/**
 * 대화 상태로부터 API 컨텍스트 생성
 */
export function buildContextFromState(
  state: ConversationState
): StreamMessageInput['context'] {
  return {
    step: state.step,
    userName: state.userName,
    collectedInfo: state.collectedInfo,
    styleProfile: state.styleProfile as Record<string, unknown> | null,
  };
}
