/**
 * 프롬프트 관리 핸들러 팩토리
 */

import { ApiResponse } from '@/shared/api/response';
import { withAdmin } from '@/shared/api/middleware';
import type {
  PromptCategory,
  PromptWithCategory,
  CreatePromptData,
  UpdatePromptData,
} from './prompt-repository';

// ============================================
// Types
// ============================================

type PromptDeps = {
  getAllCategories: () => Promise<PromptCategory[]>;
  getAllPrompts: (categorySlug?: string) => Promise<PromptWithCategory[]>;
  getPromptById: (id: string) => Promise<PromptWithCategory | null>;
  createPrompt: (data: CreatePromptData) => Promise<string>;
  updatePrompt: (id: string, updates: UpdatePromptData) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// Category Handlers
// ============================================

/**
 * GET /api/admin/prompts/categories
 */
export const createCategoryGetHandler = (deps: PromptDeps) => {
  const handler = async (): Promise<Response> => {
    try {
      const categories = await deps.getAllCategories();
      return ApiResponse.success({ categories });
    } catch (error) {
      console.error('카테고리 조회 오류:', error);
      return ApiResponse.serverError('카테고리 조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

// ============================================
// Prompt List Handlers
// ============================================

/**
 * GET /api/admin/prompts
 */
export const createPromptListGetHandler = (deps: PromptDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const url = new URL(request.url);
      const categorySlug = url.searchParams.get('category') || undefined;

      const prompts = await deps.getAllPrompts(categorySlug);
      return ApiResponse.success({ prompts });
    } catch (error) {
      console.error('프롬프트 목록 조회 오류:', error);
      return ApiResponse.serverError('프롬프트 목록 조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

/**
 * POST /api/admin/prompts
 */
export const createPromptPostHandler = (deps: PromptDeps) => {
  const handler = async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const { category_id, prompt_key, role, content } = body;

      // 필수 필드 검증
      if (!category_id) {
        return ApiResponse.validationError('category_id는 필수입니다.');
      }
      if (!prompt_key || typeof prompt_key !== 'string') {
        return ApiResponse.validationError('prompt_key는 필수입니다.');
      }
      if (!role || !['system', 'user'].includes(role)) {
        return ApiResponse.validationError(
          'role은 "system" 또는 "user"여야 합니다.'
        );
      }
      if (!content || typeof content !== 'string') {
        return ApiResponse.validationError('content는 필수입니다.');
      }

      const id = await deps.createPrompt({
        category_id,
        prompt_key,
        role,
        content,
      });

      console.log(`✅ 프롬프트 생성됨: ${prompt_key}`);
      return ApiResponse.created({ id }, '프롬프트가 생성되었습니다.');
    } catch (error) {
      console.error('프롬프트 생성 오류:', error);
      return ApiResponse.serverError('프롬프트 생성에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

// ============================================
// Prompt Detail Handlers
// ============================================

/**
 * GET /api/admin/prompts/[id]
 */
export const createPromptGetHandler = (deps: PromptDeps) => {
  const handler = async (
    _request: Request,
    context?: RouteContext
  ): Promise<Response> => {
    try {
      if (!context) {
        return ApiResponse.validationError('잘못된 요청입니다.');
      }

      const { id } = await context.params;
      const prompt = await deps.getPromptById(id);

      if (!prompt) {
        return ApiResponse.notFound('프롬프트를 찾을 수 없습니다.');
      }

      return ApiResponse.success({ prompt });
    } catch (error) {
      console.error('프롬프트 조회 오류:', error);
      return ApiResponse.serverError('프롬프트 조회에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

/**
 * PUT /api/admin/prompts/[id]
 */
export const createPromptPutHandler = (deps: PromptDeps) => {
  const handler = async (
    request: Request,
    context?: RouteContext
  ): Promise<Response> => {
    try {
      if (!context) {
        return ApiResponse.validationError('잘못된 요청입니다.');
      }

      const { id } = await context.params;
      const body = await request.json();
      const { content, is_active } = body;

      // 업데이트할 필드 구성
      const updates: UpdatePromptData = {};
      if (typeof content === 'string') updates.content = content;
      if (typeof is_active === 'boolean') updates.is_active = is_active;

      if (Object.keys(updates).length === 0) {
        return ApiResponse.validationError('변경할 데이터가 없습니다.');
      }

      // 존재 여부 확인
      const existing = await deps.getPromptById(id);
      if (!existing) {
        return ApiResponse.notFound('프롬프트를 찾을 수 없습니다.');
      }

      await deps.updatePrompt(id, updates);

      console.log(`🔄 프롬프트 수정됨: ${existing.prompt_key}`, updates);
      return ApiResponse.success({ id }, '프롬프트가 수정되었습니다.');
    } catch (error) {
      console.error('프롬프트 수정 오류:', error);
      return ApiResponse.serverError('프롬프트 수정에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};

/**
 * DELETE /api/admin/prompts/[id]
 */
export const createPromptDeleteHandler = (deps: PromptDeps) => {
  const handler = async (
    _request: Request,
    context?: RouteContext
  ): Promise<Response> => {
    try {
      if (!context) {
        return ApiResponse.validationError('잘못된 요청입니다.');
      }

      const { id } = await context.params;

      // 존재 여부 확인
      const existing = await deps.getPromptById(id);
      if (!existing) {
        return ApiResponse.notFound('프롬프트를 찾을 수 없습니다.');
      }

      await deps.deletePrompt(id);

      console.log(`❌ 프롬프트 삭제됨: ${existing.prompt_key}`);
      return ApiResponse.success({ id }, '프롬프트가 삭제되었습니다.');
    } catch (error) {
      console.error('프롬프트 삭제 오류:', error);
      return ApiResponse.serverError('프롬프트 삭제에 실패했습니다.');
    }
  };

  return withAdmin(handler);
};
