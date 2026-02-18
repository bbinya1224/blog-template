import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { ApiResponse } from '../response';

export type AuthenticatedUser = {
  email: string;
  name?: string | null;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

type AuthHandler<TContext = unknown> = (
  request: AuthenticatedRequest,
  context?: TContext
) => Promise<Response>;

export const withAuth = <TContext = unknown>(
  handler: AuthHandler<TContext>
) => {
  return async (request: Request, context?: TContext): Promise<Response> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return ApiResponse.unauthorized();
      }

      const authenticatedRequest = Object.assign(request, {
        user: {
          email: session.user.email,
          name: session.user.name,
        },
      }) as AuthenticatedRequest;

      return handler(authenticatedRequest, context);
    } catch (error) {
      console.error('인증 미들웨어 오류:', error);
      return ApiResponse.serverError();
    }
  };
};
