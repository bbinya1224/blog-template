import { createCategoryGetHandler } from '@/features/admin/api/create-prompt-handler';
import {
  getAllCategories,
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from '@/features/admin/api/prompt-repository';

const deps = {
  getAllCategories,
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
};

export const GET = createCategoryGetHandler(deps);
