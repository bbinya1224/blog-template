import { describe, it, expect, vi } from 'vitest';
import { withTimeout, withTimeoutAndRetry } from './timeout';
import { TimeoutError, AppError } from './errors';

describe('withTimeout', () => {
  it('should resolve if promise completes before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 5000);
    expect(result).toBe('success');
  });

  it('should reject with TimeoutError if timeout occurs', async () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 200);
    });

    await expect(withTimeout(promise, 50)).rejects.toThrow(TimeoutError);
  });

  it('should use custom error message', async () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 200);
    });

    const customMessage = 'Custom timeout message';
    await expect(withTimeout(promise, 50, customMessage)).rejects.toThrow(
      customMessage,
    );
  });

  it('should include timeout duration in error', async () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => resolve('success'), 200);
    });

    try {
      await withTimeout(promise, 50);
      expect.fail('Should have thrown TimeoutError');
    } catch (error) {
      expect(error).toBeInstanceOf(TimeoutError);
      if (error instanceof TimeoutError) {
        expect(error.timeoutMs).toBe(50);
      }
    }
  });
});

describe('withTimeoutAndRetry', () => {
  it('should resolve if function succeeds before timeout', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withTimeoutAndRetry(fn, 5000, { maxAttempts: 3 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it.skip('should retry if timeout occurs', async () => {
    let callCount = 0;
    const fn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return new Promise((resolve) => {
          setTimeout(() => resolve('late'), 200);
        });
      } else {
        return Promise.resolve('success');
      }
    });

    const result = await withTimeoutAndRetry(fn, 50, {
      maxAttempts: 3,
      initialDelayMs: 10,
    });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  }, 10000);

  it('should exhaust retries on persistent timeout', async () => {
    const fn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('late'), 200);
      });
    });

    await expect(
      withTimeoutAndRetry(fn, 50, {
        maxAttempts: 2,
        initialDelayMs: 10,
      }),
    ).rejects.toThrow(TimeoutError);

    expect(fn).toHaveBeenCalled();
  }, 10000);

  it('should not retry non-retryable errors', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new AppError('Validation error', 'ERROR', 400));

    await expect(
      withTimeoutAndRetry(fn, 5000, {
        maxAttempts: 3,
        initialDelayMs: 10,
      }),
    ).rejects.toThrow('Validation error');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it.skip('should call onRetry callback on timeout', async () => {
    let callCount = 0;
    const fn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return new Promise((resolve) => {
          setTimeout(() => resolve('late'), 200);
        });
      } else {
        return Promise.resolve('success');
      }
    });

    const onRetry = vi.fn();
    await withTimeoutAndRetry(fn, 50, {
      maxAttempts: 3,
      initialDelayMs: 10,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(TimeoutError));
  }, 10000);
});
