const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
} as const;

interface SSEStreamResult<TDone> {
  fullText: string;
  done: TDone;
}

function createSSEStream<TDone>(
  onStream: (emit: (token: string) => void, signal: AbortSignal) => Promise<SSEStreamResult<TDone>>,
): ReadableStream {
  const encoder = new TextEncoder();
  const abortController = new AbortController();

  return new ReadableStream({
    async start(controller) {
      try {
        const emit = (token: string) => {
          if (abortController.signal.aborted) return;
          const data = `data: ${JSON.stringify({ token })}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        const result = await onStream(emit, abortController.signal);

        if (abortController.signal.aborted) {
          controller.close();
          return;
        }

        const doneData = `event: done\ndata: ${JSON.stringify({
          fullText: result.fullText,
          ...result.done,
        })}\n\n`;
        controller.enqueue(encoder.encode(doneData));
        controller.close();
      } catch (error) {
        if (abortController.signal.aborted) {
          controller.close();
          return;
        }
        const errorData = `event: error\ndata: ${JSON.stringify({
          message: error instanceof Error ? error.message : 'Unknown error',
        })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
    },
  });
}

function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, { headers: SSE_HEADERS });
}

export { createSSEStream, createSSEResponse };
