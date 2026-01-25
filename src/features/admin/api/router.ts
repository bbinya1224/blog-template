import { router, adminProcedure } from '@/shared/api/trpc/init';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import {
  getAllUsers,
  getUserByEmail,
  addUser,
  updateUser,
  deleteUser,
} from './whitelist-repository';
import {
  getAllCategories,
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from './prompt-repository';

const whitelistAddSchema = z.object({
  email: z.string().email('유효하지 않은 이메일 형식입니다.'),
  notes: z.string().optional(),
});

const whitelistUpdateSchema = z.object({
  email: z.string(),
  is_preview: z.boolean().optional(),
  usage_count: z.number().optional(),
});

const whitelistDeleteSchema = z.object({
  email: z.string(),
});

const promptCreateSchema = z.object({
  category_id: z.string().min(1, 'category_id는 필수입니다.'),
  prompt_key: z.string().min(1, 'prompt_key는 필수입니다.'),
  role: z.enum(['system', 'user'], {
    message: 'role은 "system" 또는 "user"여야 합니다.',
  }),
  content: z.string().min(1, 'content는 필수입니다.'),
});

const promptUpdateSchema = z.object({
  id: z.string(),
  content: z.string().optional(),
  is_active: z.boolean().optional(),
});

const promptDeleteSchema = z.object({
  id: z.string(),
});

const promptListSchema = z.object({
  category: z.string().optional(),
});

export const adminRouter = router({
  whitelist: router({
    list: adminProcedure.query(async () => {
      const users = await getAllUsers();
      return { users };
    }),

    add: adminProcedure
      .input(whitelistAddSchema)
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '이미 존재하는 이메일입니다.',
          });
        }

        await addUser(input.email, input.notes || '관리자 수동 승인');

        console.log(`✅ 관리자가 추가함: ${input.email}`);
        return { email: input.email, message: '사용자가 추가되었습니다.' };
      }),

    update: adminProcedure
      .input(whitelistUpdateSchema)
      .mutation(async ({ input }) => {
        const { email, ...updates } = input;

        if (Object.keys(updates).length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '변경할 데이터가 없습니다.',
          });
        }

        await updateUser(email, updates);

        console.log(`🔄 관리자가 업데이트함: ${email}`, updates);
        return { email, updates, message: '업데이트되었습니다.' };
      }),

    delete: adminProcedure
      .input(whitelistDeleteSchema)
      .mutation(async ({ input }) => {
        await deleteUser(input.email);

        console.log(`❌ 관리자가 제거함: ${input.email}`);
        return { email: input.email, message: '사용자가 삭제되었습니다.' };
      }),
  }),

  prompts: router({
    list: adminProcedure.input(promptListSchema).query(async ({ input }) => {
      const prompts = await getAllPrompts(input.category);
      return { prompts };
    }),

    get: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const prompt = await getPromptById(input.id);

        if (!prompt) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '프롬프트를 찾을 수 없습니다.',
          });
        }

        return { prompt };
      }),

    create: adminProcedure
      .input(promptCreateSchema)
      .mutation(async ({ input }) => {
        const id = await createPrompt(input);

        console.log(`✅ 프롬프트 생성됨: ${input.prompt_key}`);
        return { id, message: '프롬프트가 생성되었습니다.' };
      }),

    update: adminProcedure
      .input(promptUpdateSchema)
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;

        if (Object.keys(updates).length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '변경할 데이터가 없습니다.',
          });
        }

        const existing = await getPromptById(id);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '프롬프트를 찾을 수 없습니다.',
          });
        }

        await updatePrompt(id, updates);

        console.log(`🔄 프롬프트 수정됨: ${existing.prompt_key}`, updates);
        return { id, message: '프롬프트가 수정되었습니다.' };
      }),

    delete: adminProcedure
      .input(promptDeleteSchema)
      .mutation(async ({ input }) => {
        const existing = await getPromptById(input.id);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '프롬프트를 찾을 수 없습니다.',
          });
        }

        await deletePrompt(input.id);

        console.log(`❌ 프롬프트 삭제됨: ${existing.prompt_key}`);
        return { id: input.id, message: '프롬프트가 삭제되었습니다.' };
      }),

    categories: adminProcedure.query(async () => {
      const categories = await getAllCategories();
      return { categories };
    }),
  }),
});
