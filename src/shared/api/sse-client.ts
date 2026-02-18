import { SSEError } from '@/shared/lib/errors';

export { SSEError };

interface SSECallbacks {
  onToken: (fullText: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: SSEError) => void;
}

interface SSEOptions {
  maxParseErrors?: number;
  signal?: AbortSignal;
}

const DEFAULT_MAX_PARSE_ERRORS = 5;

export async function apiSSE(
  url: string,
  body: unknown,
  callbacks: SSECallbacks,
  options?: SSEOptions,
): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!response.ok) throw new SSEError(`SSE request failed: ${response.status}`);

  const reader = response.body?.getReader();
  if (!reader) throw new SSEError('No response body');

  const decoder = new TextDecoder();
  const maxParseErrors = options?.maxParseErrors ?? DEFAULT_MAX_PARSE_ERRORS;

  let buffer = '';
  let fullText = '';
  let currentEvent: string | null = null;
  let parseErrorCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (currentEvent === 'error') {
              const sseError = new SSEError(data.message || 'Stream error');
              callbacks.onError?.(sseError);
              throw sseError;
            } else if (currentEvent === 'done') {
              if (data.fullText) {
                fullText = data.fullText;
              }
              callbacks.onDone?.(fullText);
            } else {
              if (data.token) {
                fullText += data.token;
                callbacks.onToken(fullText);
              } else if (data.fullText) {
                fullText = data.fullText;
              }
            }

            parseErrorCount = 0;
            currentEvent = null;
          } catch (e) {
            if (e instanceof SSEError) throw e;

            parseErrorCount++;
            if (parseErrorCount > maxParseErrors) {
              throw new SSEError('Too many parse errors in stream');
            }
            console.warn('[apiSSE] parse error:', e);
          }
        }
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // reader already closed
    }
  }

  return fullText;
}
