import { NextResponse } from 'next/server';
import { ErrorCode } from '@/shared/types/api';

export const ApiResponse = {
  /**
   * 성공 응답 (200)
   */
  success<T>(data: T, message?: string, status = 200) {
    return NextResponse.json({ success: true, data, message }, { status });
  },

  /**
   * 생성 성공 응답 (201)
   */
  created<T>(data: T, message?: string) {
    return this.success(data, message, 201);
  },

  /**
   * 에러 응답
   */
  error(code: string, message: string, status = 400, details?: unknown) {
    return NextResponse.json(
      { success: false, error: { code, message, details } },
      { status },
    );
  },

  /**
   * 401 Unauthorized
   */
  unauthorized(message = '인증이 필요합니다.') {
    return this.error(ErrorCode.UNAUTHORIZED, message, 401);
  },

  /**
   * 403 Forbidden
   */
  forbidden(message = '권한이 없습니다.') {
    return this.error(ErrorCode.FORBIDDEN, message, 403);
  },

  /**
   * 403 Quota Exceeded
   */
  quotaExceeded(
    message = '무료 체험 횟수가 만료되었습니다. 후원 후 계속 이용해주세요!',
  ) {
    return this.error(ErrorCode.QUOTA_EXCEEDED, message, 403);
  },

  /**
   * 404 Not Found
   */
  notFound(message = '리소스를 찾을 수 없습니다.') {
    return this.error(ErrorCode.NOT_FOUND, message, 404);
  },

  /**
   * 400 Validation Error
   */
  validationError(message = '잘못된 요청 형식입니다.', details?: unknown) {
    return this.error(ErrorCode.VALIDATION_ERROR, message, 400, details);
  },

  /**
   * 409 Conflict
   */
  conflict(message = '리소스가 이미 존재합니다.') {
    return this.error(ErrorCode.CONFLICT, message, 409);
  },

  /**
   * 500 Internal Server Error
   */
  serverError(message = '서버 오류가 발생했습니다.') {
    return this.error(ErrorCode.INTERNAL_ERROR, message, 500);
  },

  /**
   * 408 Request Timeout
   */
  timeout(message = '요청 시간이 초과되었습니다.') {
    return this.error(ErrorCode.TIMEOUT, message, 408);
  },

  /**
   * 429 Rate Limit Exceeded
   */
  rateLimitExceeded(
    message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  ) {
    return this.error(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
  },

  /**
   * 503 Service Unavailable
   */
  serviceUnavailable(message = '일시적으로 서비스를 사용할 수 없습니다.') {
    return this.error(ErrorCode.SERVICE_UNAVAILABLE, message, 503);
  },
};
