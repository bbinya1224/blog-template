import { ApiResponse } from '../response';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const MAX_MAP_ENTRIES = 10000;

function getClientIp(request: Request): string | null {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    null
  );
}

function cleanExpiredEntries(): void {
  const now = Date.now();
  for (const [key, value] of requestCounts) {
    if (now > value.resetAt) requestCounts.delete(key);
  }
}

export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig,
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request);

    // IP를 식별할 수 없으면 rate limit 없이 통과 (fail-open)
    if (!ip) {
      return handler(request);
    }

    const now = Date.now();
    const record = requestCounts.get(ip);

    if (record && now < record.resetAt) {
      if (record.count >= config.maxRequests) {
        return ApiResponse.rateLimitExceeded();
      }
      record.count++;
    } else {
      if (requestCounts.size >= MAX_MAP_ENTRIES) {
        cleanExpiredEntries();
      }
      // 정리 후에도 여전히 가득 차면 rate limit 없이 통과
      if (requestCounts.size >= MAX_MAP_ENTRIES) {
        return handler(request);
      }
      requestCounts.set(ip, { count: 1, resetAt: now + config.windowMs });
    }

    return handler(request);
  };
}
