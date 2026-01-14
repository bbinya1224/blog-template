/**
 * 관리자 인증 미들웨어
 * X-Admin-Password 헤더 검증
 */

import { ApiResponse } from '../response';

type AdminHandler<TContext = unknown> = (
  request: Request,
  context?: TContext
) => Promise<Response>;

/**
 * 관리자 인증이 필요한 핸들러를 감싸는 미들웨어
 *
 * @example
 * const handler = withAdmin(async (request) => {
 *   // 관리자 인증 완료된 상태
 * });
 */
export const withAdmin = <TContext = unknown>(
  handler: AdminHandler<TContext>
) => {
  return async (request: Request, context?: TContext): Promise<Response> => {
    try {
      const password = request.headers.get('X-Admin-Password');
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        console.error('ADMIN_PASSWORD가 설정되지 않았습니다');
        return ApiResponse.serverError();
      }

      if (!password || password !== adminPassword) {
        return ApiResponse.unauthorized('관리자 인증 실패');
      }

      return handler(request, context);
    } catch (error) {
      console.error('관리자 인증 미들웨어 오류:', error);
      return ApiResponse.serverError();
    }
  };
};
