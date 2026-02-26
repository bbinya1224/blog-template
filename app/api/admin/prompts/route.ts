import {
  createPromptListGetHandler,
  createPromptPostHandler,
} from '@/features/admin/api/createPromptHandler';
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

export const GET = createPromptListGetHandler(deps);
export const POST = createPromptPostHandler(deps);
