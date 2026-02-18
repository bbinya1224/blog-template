import { supabaseAdmin } from '@/shared/lib/supabase';
import { invalidatePromptCache } from '@/shared/api/promptService';

// ============================================
// Types
// ============================================

export type PromptCategory = {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Prompt = {
  id: string;
  category_id: string;
  prompt_key: string;
  role: 'system' | 'user';
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromptWithCategory = Prompt & {
  category: Pick<PromptCategory, 'slug' | 'display_name'>;
};

export type CreatePromptData = {
  category_id: string;
  prompt_key: string;
  role: 'system' | 'user';
  content: string;
};

export type UpdatePromptData = {
  content?: string;
  is_active?: boolean;
};

// ============================================
// Category Operations
// ============================================

export const getAllCategories = async (): Promise<PromptCategory[]> => {
  const { data, error } = await supabaseAdmin
    .from('prompt_categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('카테고리 조회 실패:', error);
    throw error;
  }

  return data || [];
};

// ============================================
// Prompt Operations
// ============================================

export const getAllPrompts = async (
  categorySlug?: string
): Promise<PromptWithCategory[]> => {
  let query = supabaseAdmin
    .from('prompts')
    .select(
      `
      *,
      category:prompt_categories!inner(slug, display_name)
    `
    )
    .order('prompt_key', { ascending: true });

  if (categorySlug) {
    query = query.eq('prompt_categories.slug', categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error('프롬프트 목록 조회 실패:', error);
    throw error;
  }

  return (data || []) as PromptWithCategory[];
};

export const getPromptById = async (
  id: string
): Promise<PromptWithCategory | null> => {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select(
      `
      *,
      category:prompt_categories!inner(slug, display_name)
    `
    )
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('프롬프트 조회 실패:', error);
    throw error;
  }

  return data as PromptWithCategory | null;
};

export const createPrompt = async (
  promptData: CreatePromptData
): Promise<string> => {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .insert({
      ...promptData,
      version: 1,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('프롬프트 생성 실패:', error);
    throw error;
  }

  // 캐시 무효화
  invalidatePromptCache();

  return data.id;
};

export const updatePrompt = async (
  id: string,
  updates: UpdatePromptData
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('prompts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error('프롬프트 수정 실패:', error);
    throw error;
  }

  // 캐시 무효화
  invalidatePromptCache();
};

export const deletePrompt = async (id: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('prompts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('프롬프트 삭제 실패:', error);
    throw error;
  }

  // 캐시 무효화
  invalidatePromptCache();
};
