import { NextResponse } from 'next/server';
import { ErrorCode } from '@/shared/types/api';

export const ApiResponse = {
  success<T>(data: T, message?: string, status = 200) {
    return NextResponse.json({ success: true, data, message }, { status });
  },

  created<T>(data: T, message?: string) {
    return this.success(data, message, 201);
  },

  error(code: string, message: string, status = 400, details?: unknown) {
    return NextResponse.json(
      { success: false, error: { code, message, details } },
      { status },
    );
  },

  unauthorized(message = '인증이 필요합니다.') {
    return this.error(ErrorCode.UNAUTHORIZED, message, 401);
  },

  forbidden(message = '권한이 없습니다.') {
    return this.error(ErrorCode.FORBIDDEN, message, 403);
  },

  quotaExceeded(
    message = '무료 체험 횟수가 만료되었습니다. 후원 후 계속 이용해주세요!',
  ) {
    return this.error(ErrorCode.QUOTA_EXCEEDED, message, 403);
  },

  notFound(message = '리소스를 찾을 수 없습니다.') {
    return this.error(ErrorCode.NOT_FOUND, message, 404);
  },

  validationError(message = '잘못된 요청 형식입니다.', details?: unknown) {
    return this.error(ErrorCode.VALIDATION_ERROR, message, 400, details);
  },

  conflict(message = '리소스가 이미 존재합니다.') {
    return this.error(ErrorCode.CONFLICT, message, 409);
  },

  serverError(message = '서버 오류가 발생했습니다.') {
    return this.error(ErrorCode.INTERNAL_ERROR, message, 500);
  },

  timeout(message = '요청 시간이 초과되었습니다.') {
    return this.error(ErrorCode.TIMEOUT, message, 408);
  },

  rateLimitExceeded(
    message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  ) {
    return this.error(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
  },

  serviceUnavailable(message = '일시적으로 서비스를 사용할 수 없습니다.') {
    return this.error(ErrorCode.SERVICE_UNAVAILABLE, message, 503);
  },
};
