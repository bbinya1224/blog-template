'use client';

import { useState, useCallback, useRef } from 'react';
import { streamChatMessage, type StreamMessageInput } from '../api/chat-api';

export interface UseStreamMessageReturn {
  streamedText: string;
  isStreaming: boolean;
  error: Error | null;
  startStream: (input: StreamMessageInput) => Promise<string>;
  cancelStream: () => void;
  clearStream: () => void;
}

export function useStreamMessage(): UseStreamMessageReturn {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (input: StreamMessageInput): Promise<string> => {
      setStreamedText('');
      setIsStreaming(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      return new Promise((resolve, reject) => {
        let fullText = '';

        streamChatMessage(input, {
          onToken: (token) => {
            fullText += token;
            setStreamedText(fullText);
          },
          onDone: (text) => {
            setIsStreaming(false);
            setStreamedText(text);
            resolve(text);
          },
          onError: (err) => {
            setIsStreaming(false);
            setError(err);
            reject(err);
          },
        }).catch((err) => {
          setIsStreaming(false);
          setError(err);
          reject(err);
        });
      });
    },
    []
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearStream = useCallback(() => {
    setStreamedText('');
    setError(null);
  }, []);

  return {
    streamedText,
    isStreaming,
    error,
    startStream,
    cancelStream,
    clearStream,
  };
}
