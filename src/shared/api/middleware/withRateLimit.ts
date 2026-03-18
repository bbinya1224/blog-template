import { ApiResponse } from '../response';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const MAX_MAP_ENTRIES = 10000;

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    'unknown'
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
      requestCounts.set(ip, { count: 1, resetAt: now + config.windowMs });
    }

    return handler(request);
  };
}
