'use client';

import { useState, useCallback, useMemo } from 'react';
import { createAdminClient } from '@/shared/api/adminClient';

export type PromptCategory = {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
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
  category: {
    slug: string;
    display_name: string;
  };
};

export const usePrompts = (adminPassword: string) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = useMemo(() => createAdminClient(adminPassword), [adminPassword]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await client.get<{ categories: PromptCategory[] }>('/api/admin/prompts/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('카테고리 조회 오류:', err);
      setError(err instanceof Error ? err.message : '카테고리 조회 실패');
    }
  }, [client]);

  const fetchPrompts = useCallback(
    async (categorySlug?: string) => {
      setLoading(true);
      setError(null);

      try {
        const params = categorySlug ? { category: categorySlug } : undefined;
        const data = await client.get<{ prompts: Prompt[] }>('/api/admin/prompts', params);
        setPrompts(data.prompts);
      } catch (err) {
        console.error('프롬프트 조회 오류:', err);
        setError(err instanceof Error ? err.message : '프롬프트 조회 실패');
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const updatePrompt = useCallback(
    async (id: string, updates: { content?: string; is_active?: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        await client.put(`/api/admin/prompts/${id}`, updates);

        setPrompts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );

        return true;
      } catch (err) {
        console.error('프롬프트 수정 오류:', err);
        setError(err instanceof Error ? err.message : '프롬프트 수정 실패');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      if (!confirm('정말 삭제하시겠습니까?')) return false;

      setLoading(true);
      setError(null);

      try {
        await client.delete(`/api/admin/prompts/${id}`);

        setPrompts((prev) => prev.filter((p) => p.id !== id));

        return true;
      } catch (err) {
        console.error('프롬프트 삭제 오류:', err);
        setError(err instanceof Error ? err.message : '프롬프트 삭제 실패');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    prompts,
    categories,
    loading,
    error,
    fetchCategories,
    fetchPrompts,
    updatePrompt,
    deletePrompt,
  };
};
