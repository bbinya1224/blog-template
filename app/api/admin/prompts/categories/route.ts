import { createCategoryGetHandler } from '@/features/admin/api/createPromptHandler';
import {
  getAllCategories,
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from '@/features/admin/api/promptRepository';

const deps = {
  getAllCategories,
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
};

export const GET = createCategoryGetHandler(deps);
