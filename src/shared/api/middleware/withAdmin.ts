import bcrypt from 'bcrypt';
import { ErrorCode } from '@/shared/types/api';
import { ApiResponse } from '../response';

type AdminHandler<TContext = unknown> = (
  request: Request,
  context?: TContext,
) => Promise<Response>;

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  failureDelayMs: 1000,
};

const failedAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() > record.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return record.count >= RATE_LIMIT.maxAttempts;
}

const MAX_MAP_ENTRIES = 10000;

function recordFailure(ip: string): void {
  if (failedAttempts.size >= MAX_MAP_ENTRIES) {
    const now = Date.now();
    for (const [key, value] of failedAttempts) {
      if (now > value.resetAt) failedAttempts.delete(key);
    }
  }

  const record = failedAttempts.get(ip);
  if (record && Date.now() < record.resetAt) {
    record.count++;
  } else {
    failedAttempts.set(ip, {
      count: 1,
      resetAt: Date.now() + RATE_LIMIT.windowMs,
    });
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const withAdmin = <TContext = unknown>(
  handler: AdminHandler<TContext>,
) => {
  return async (request: Request, context?: TContext): Promise<Response> => {
    try {
      const clientIp = getClientIp(request);

      if (isRateLimited(clientIp)) {
        return ApiResponse.error(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          '너무 많은 시도가 감지되었습니다. 잠시 후 다시 시도해주세요.',
          429,
        );
      }

      const password = request.headers.get('X-Admin-Password');
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      if (!adminPasswordHash) {
        console.error('ADMIN_PASSWORD_HASH가 설정되지 않았습니다');
        return ApiResponse.serverError();
      }

      if (!password) {
        await bcrypt.compare('dummy', adminPasswordHash);
        recordFailure(clientIp);
        await delay(RATE_LIMIT.failureDelayMs);
        return ApiResponse.unauthorized('관리자 인증 실패');
      }

      const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

      if (!isValidPassword) {
        recordFailure(clientIp);
        await delay(RATE_LIMIT.failureDelayMs);
        return ApiResponse.unauthorized('관리자 인증 실패');
      }

      return handler(request, context);
    } catch (error) {
      console.error('관리자 인증 미들웨어 오류:', error);
      return ApiResponse.serverError();
    }
  };
};
