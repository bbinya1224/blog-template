import { withRetry, RetryOptions } from './retry';
import { TimeoutError } from './errors';

const createTimeoutPromise = (
  timeoutMs: number,
  errorMessage?: string,
): { promise: Promise<never>; clear: () => void } => {
  let timerId: NodeJS.Timeout;

  const promise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(
        new TimeoutError(
          errorMessage ?? `요청 시간이 초과되었습니다. (${timeoutMs}ms)`,
          timeoutMs,
        ),
      );
    }, timeoutMs);
  });

  return {
    promise,
    clear: () => clearTimeout(timerId),
  };
};

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string,
): Promise<T> => {
  const timeout = createTimeoutPromise(timeoutMs, errorMessage);

  return Promise.race([promise, timeout.promise]).finally(() => {
    timeout.clear();
  });
};

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
