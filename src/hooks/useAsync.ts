/**
 * 비동기 작업을 관리하는 범용 커스텀 훅
 * - 로딩 상태, 에러 처리, 데이터 관리
 * - 타입 안전성 보장
 */

import { useCallback, useState } from 'react';

type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAsyncState<T> {
  data: T | null;
  status: AsyncStatus;
  error: string | null;
}

interface UseAsyncReturn<T, Args extends unknown[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export const useAsync = <T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
): UseAsyncReturn<T, Args> => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, status: 'loading', error: null });

      try {
        const data = await asyncFunction(...args);
        setState({ data, status: 'success', error: null });
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        setState({ data: null, status: 'error', error: errorMessage });
        return null;
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setState({ data: null, status: 'idle', error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  };
};
