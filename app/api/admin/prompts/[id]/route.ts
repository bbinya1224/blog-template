import {
  createPromptGetHandler,
  createPromptPutHandler,
  createPromptDeleteHandler,
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

export const GET = createPromptGetHandler(deps);
export const PUT = createPromptPutHandler(deps);
export const DELETE = createPromptDeleteHandler(deps);
