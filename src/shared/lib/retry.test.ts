import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateBackoff,
  isRetryableError,
  withRetry,
  withRetryResult,
} from './retry';
import { AppError, Ok, Err } from './errors';

describe('calculateBackoff', () => {
  it('should calculate exponential backoff correctly', () => {
    const delay1 = calculateBackoff(1, 1000, 10000, 2);
    expect(delay1).toBeGreaterThanOrEqual(1000);
    expect(delay1).toBeLessThanOrEqual(1100);

    const delay2 = calculateBackoff(2, 1000, 10000, 2);
    expect(delay2).toBeGreaterThanOrEqual(2000);
    expect(delay2).toBeLessThanOrEqual(2200);

    const delay3 = calculateBackoff(3, 1000, 10000, 2);
    expect(delay3).toBeGreaterThanOrEqual(4000);
    expect(delay3).toBeLessThanOrEqual(4400);
  });

  it('should cap at maxDelayMs', () => {
    const delay = calculateBackoff(10, 1000, 5000, 2);
    expect(delay).toBeLessThanOrEqual(5500);
  });

  it('should include jitter (randomness)', () => {
    const originalRandom = Math.random;
    const mockRandomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95];
    let callIndex = 0;

    try {
      Math.random = () => mockRandomValues[callIndex++ % mockRandomValues.length];

      const delays = Array.from({ length: 10 }, () =>
        calculateBackoff(1, 1000, 10000, 2),
      );
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    } finally {
      Math.random = originalRandom;
    }
  });
});

describe('isRetryableError', () => {
  it('should identify 408 timeout status as retryable', () => {
    const error = new AppError('Request timeout', 'TIMEOUT', 408);
    expect(isRetryableError(error)).toBe(true);
  });

  it('should identify 429 status as retryable', () => {
    const error = new AppError('Rate limit', 'RATE_LIMIT', 429);
    expect(isRetryableError(error)).toBe(true);
  });

  it('should identify 5xx status as retryable', () => {
    const error500 = new AppError('Server error', 'ERROR', 500);
    const error503 = new AppError('Service unavailable', 'ERROR', 503);
    expect(isRetryableError(error500)).toBe(true);
    expect(isRetryableError(error503)).toBe(true);
  });

  it('should identify network errors as retryable', () => {
    const timeoutError = { code: 'ETIMEDOUT' };
    const connectionError = { code: 'ECONNREFUSED' };
    expect(isRetryableError(timeoutError)).toBe(true);
    expect(isRetryableError(connectionError)).toBe(true);
  });

  it('should identify fetch TypeError as retryable', () => {
    const fetchError = new TypeError('fetch failed');
    expect(isRetryableError(fetchError)).toBe(true);
  });

  it('should not retry 4xx errors (except 429)', () => {
    const error400 = new AppError('Bad request', 'ERROR', 400);
    const error404 = new AppError('Not found', 'ERROR', 404);
    expect(isRetryableError(error400)).toBe(false);
    expect(isRetryableError(error404)).toBe(false);
  });

  it('should not retry validation errors', () => {
    const error = new Error('Validation failed');
    expect(isRetryableError(error)).toBe(false);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return immediately on success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const promise = withRetry(fn, { maxAttempts: 3, initialDelayMs: 1000 });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new AppError('Timeout', 'ERROR', 500))
      .mockResolvedValue('success');

    const onRetry = vi.fn();
    const promise = withRetry(fn, {
      maxAttempts: 3,
      initialDelayMs: 1000,
      onRetry,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not retry on non-retryable error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new AppError('Bad request', 'ERROR', 400));

    const promise = withRetry(fn, { maxAttempts: 3, initialDelayMs: 1000 });
    const expectation = expect(promise).rejects.toThrow('Bad request');
    await vi.runAllTimersAsync();

    await expectation;
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should exhaust retries and throw last error', async () => {
    const error = new AppError('Persistent error', 'ERROR', 500);
    const fn = vi.fn().mockRejectedValue(error);

    const promise = withRetry(fn, { maxAttempts: 3, initialDelayMs: 100 });
    const expectation = expect(promise).rejects.toThrow('Persistent error');
    await vi.runAllTimersAsync();

    await expectation;
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should apply custom retryable error check', async () => {
    const customError = new Error('Custom error');
    const fn = vi.fn().mockRejectedValue(customError);

    const retryableErrors = (error: unknown) => {
      return error instanceof Error && error.message.includes('Custom');
    };

    const promise = withRetry(fn, {
      maxAttempts: 2,
      initialDelayMs: 100,
      retryableErrors,
    });
    const expectation = expect(promise).rejects.toThrow('Custom error');
    await vi.runAllTimersAsync();

    await expectation;
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('withRetryResult', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return success result immediately', async () => {
    const fn = vi.fn().mockResolvedValue(Ok('success'));
    const promise = withRetryResult(fn, {
      maxAttempts: 3,
      initialDelayMs: 1000,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('success');
    }
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable error in Result', async () => {
    const error = new AppError('Timeout', 'ERROR', 500);
    const fn = vi
      .fn()
      .mockResolvedValueOnce(Err(error))
      .mockResolvedValue(Ok('success'));

    const promise = withRetryResult(fn, {
      maxAttempts: 3,
      initialDelayMs: 1000,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable error in Result', async () => {
    const error = new AppError('Bad request', 'ERROR', 400);
    const fn = vi.fn().mockResolvedValue(Err(error));

    const promise = withRetryResult(fn, {
      maxAttempts: 3,
      initialDelayMs: 1000,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('Bad request');
    }
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle thrown exceptions and convert to Result', async () => {
    const error = new AppError('Server error', 'ERROR', 500);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(Ok('success'));

    const promise = withRetryResult(fn, {
      maxAttempts: 3,
      initialDelayMs: 1000,
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.success).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
