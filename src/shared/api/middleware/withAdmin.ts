import bcrypt from 'bcrypt';
import { ApiResponse } from '../response';

type AdminHandler<TContext = unknown> = (
  request: Request,
  context?: TContext,
) => Promise<Response>;

export const withAdmin = <TContext = unknown>(
  handler: AdminHandler<TContext>,
) => {
  return async (request: Request, context?: TContext): Promise<Response> => {
    try {
      const password = request.headers.get('X-Admin-Password');
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      if (!adminPasswordHash) {
        console.error('ADMIN_PASSWORD_HASH가 설정되지 않았습니다');
        return ApiResponse.serverError();
      }

      if (!password) {
        return ApiResponse.unauthorized('관리자 인증 실패');
      }

      const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

      if (!isValidPassword) {
        return ApiResponse.unauthorized('관리자 인증 실패');
      }

      return handler(request, context);
    } catch (error) {
      console.error('관리자 인증 미들웨어 오류:', error);
      return ApiResponse.serverError();
    }
  };
};
