import { ApiResponse } from '@/shared/api/response';
import { withAdmin } from '@/shared/api/middleware';
import { isValidEmail } from '@/shared/lib/validators';

type WhitelistUser = {
  id: string;
  email: string;
  approved_at: string | null;
  bmac_transaction_id: string | null;
  notes: string | null;
  created_at: string | null;
  is_preview: boolean | null;
  usage_count: number | null;
};

type WhitelistDeps = {
  getAllUsers: () => Promise<WhitelistUser[]>;
  getUserByEmail: (email: string) => Promise<WhitelistUser | null>;
  addUser: (email: string, notes?: string) => Promise<void>;
  updateUser: (
    email: string,
    updates: { is_preview?: boolean; usage_count?: number }
  ) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
};

export const createWhitelistGetHandler = (deps: WhitelistDeps) => {
  const handler = async (): Promise<Response> => {
    try {
      const users = await deps.getAllUsers();
      return ApiResponse.success({ users });
    } catch (error) {
      console.error('화이트리스트 조회 오류:', error);
      return ApiResponse.serverError('조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

export const createWhitelistPostHandler = (deps: WhitelistDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const { email, notes } = await request.json();

      // 이메일 검증
      if (!isValidEmail(email)) {
        return ApiResponse.validationError('유효하지 않은 이메일 형식입니다.');
      }

      const existing = await deps.getUserByEmail(email);
      if (existing) {
        return ApiResponse.conflict('이미 존재하는 이메일입니다.');
      }

      await deps.addUser(email, notes || '관리자 수동 승인');

      console.log(`✅ 관리자가 추가함: ${email}`);
      return ApiResponse.created({ email }, '사용자가 추가되었습니다.');
    } catch (error) {
      console.error('화이트리스트 추가 오류:', error);
      return ApiResponse.serverError('추가에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

export const createWhitelistPutHandler = (deps: WhitelistDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const { email, is_preview, usage_count } = await request.json();

      if (!email || typeof email !== 'string') {
        return ApiResponse.validationError('이메일이 필요합니다.');
      }

      const updates: { is_preview?: boolean; usage_count?: number } = {};
      if (typeof is_preview === 'boolean') updates.is_preview = is_preview;
      if (typeof usage_count === 'number') updates.usage_count = usage_count;

      if (Object.keys(updates).length === 0) {
        return ApiResponse.validationError('변경할 데이터가 없습니다.');
      }

      await deps.updateUser(email, updates);

      console.log(`🔄 관리자가 업데이트함: ${email}`, updates);
      return ApiResponse.success({ email, updates }, '업데이트되었습니다.');
    } catch (error) {
      console.error('화이트리스트 업데이트 오류:', error);
      return ApiResponse.serverError('업데이트에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

export const createWhitelistDeleteHandler = (deps: WhitelistDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const { email } = await request.json();

      if (!email || typeof email !== 'string') {
        return ApiResponse.validationError('이메일이 필요합니다.');
      }

      await deps.deleteUser(email);

      console.log(`❌ 관리자가 제거함: ${email}`);
      return ApiResponse.success({ email }, '사용자가 삭제되었습니다.');
    } catch (error) {
      console.error('화이트리스트 삭제 오류:', error);
      return ApiResponse.serverError('삭제에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};
