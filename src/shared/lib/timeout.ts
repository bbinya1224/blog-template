import { withRetry, RetryOptions } from './retry';
import { TimeoutError } from './errors';

/**
 * Promise에 타임아웃 적용
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string,
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new TimeoutError(
          errorMessage ?? `요청 시간이 초과되었습니다. (${timeoutMs}ms)`,
          timeoutMs,
        ),
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

/**
 * 함수에 타임아웃과 재시도 로직을 동시에 적용
 */
export const withTimeoutAndRetry = async <T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions?: Partial<RetryOptions>,
  errorMessage?: string,
): Promise<T> => {
  return withRetry(
    () => withTimeout(fn(), timeoutMs, errorMessage),
    retryOptions,
  );
};
