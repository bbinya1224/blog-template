import { Result, Err, AppError } from './errors';

/**
 * 재시도 설정 옵션
 */
export interface RetryOptions {
  /** 최대 재시도 횟수 (기본: 3회) */
  maxAttempts: number;
  /** 초기 지연 시간 (ms, 기본: 1000ms) */
  initialDelayMs: number;
  /** 최대 지연 시간 (ms, 기본: 10000ms) */
  maxDelayMs: number;
  /** 백오프 배수 (기본: 2) */
  backoffMultiplier: number;
  /** 재시도 가능 에러 판단 함수 */
  retryableErrors?: (error: unknown) => boolean;
  /** 재시도 시 콜백 */
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * 지수 백오프 계산 (Jitter 포함)
 */
export const calculateBackoff = (
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number,
): number => {
  const exponentialDelay =
    initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  const jitter = Math.random() * cappedDelay * 0.1;
  return Math.floor(cappedDelay + jitter);
};

/**
 * 재시도 가능한 에러인지 판단
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.statusCode === 408 || error.statusCode === 429 || error.statusCode >= 500;
  }

  if (error && typeof error === 'object') {
    // Check status first
    if ('status' in error) {
      const status = (error as { status: number }).status;
      if (status === 408 || status === 429 || status >= 500) {
        return true;
      }
    }

    // Check code for network errors
    if ('code' in error) {
      const code = (error as { code: string }).code;
      return [
        'ECONNABORTED',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'ENOTFOUND',
      ].includes(code);
    }

    // If status exists but is not retryable, and no code exists, return false
    if ('status' in error) {
      return false;
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  return false;
};

/**
 * 비동기 함수에 재시도 로직 적용
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> => {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const maxAttempts = Math.max(1, opts.maxAttempts);
  const retryableCheck = opts.retryableErrors ?? isRetryableError;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      if (!retryableCheck(error)) {
        throw error;
      }

      if (opts.onRetry) {
        opts.onRetry(attempt, error);
      }

      const delayMs = calculateBackoff(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
        opts.backoffMultiplier,
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};

/**
 * 재시도 가능 여부를 확인하고 지연 시간만큼 대기
 * @returns 재시도 가능 여부
 */
const handleRetryDelay = async (
  error: unknown,
  attempt: number,
  opts: RetryOptions,
  retryableCheck: (error: unknown) => boolean,
): Promise<boolean> => {
  if (!retryableCheck(error)) {
    return false;
  }

  if (opts.onRetry) {
    opts.onRetry(attempt, error);
  }

  const delayMs = calculateBackoff(
    attempt,
    opts.initialDelayMs,
    opts.maxDelayMs,
    opts.backoffMultiplier,
  );

  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return true;
};

/**
 * Result 타입을 반환하는 함수에 재시도 로직 적용
 */
export const withRetryResult = async <T, E = AppError>(
  fn: () => Promise<Result<T, E>>,
  options: Partial<RetryOptions> = {},
): Promise<Result<T, E>> => {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const maxAttempts = Math.max(1, opts.maxAttempts);
  const retryableCheck = opts.retryableErrors ?? isRetryableError;

  let lastResult: Result<T, E> | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isLastAttempt = attempt === maxAttempts;

    try {
      const result = await fn();

      if (result.success) {
        return result;
      }

      lastResult = result;

      if (isLastAttempt) {
        return result;
      }

      const shouldRetry = await handleRetryDelay(
        result.error,
        attempt,
        opts,
        retryableCheck,
      );

      if (!shouldRetry) {
        return result;
      }
    } catch (error) {
      if (isLastAttempt) {
        return Err(error as E);
      }

      const shouldRetry = await handleRetryDelay(
        error,
        attempt,
        opts,
        retryableCheck,
      );

      if (!shouldRetry) {
        return Err(error as E);
      }
    }
  }

  return lastResult ?? Err(new Error('No result available') as E);
};
