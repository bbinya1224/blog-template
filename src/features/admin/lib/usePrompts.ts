'use client';

import { useState, useCallback } from 'react';

// ============================================
// Types
// ============================================

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

// ============================================
// Hook
// ============================================

export const usePrompts = (adminPassword: string) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Password': adminPassword,
  };

  /**
   * 카테고리 목록 조회
   */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/prompts/categories', { headers });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error?.message || '카테고리 조회 실패');
      }

      setCategories(data.data.categories);
    } catch (err) {
      console.error('카테고리 조회 오류:', err);
      setError(err instanceof Error ? err.message : '카테고리 조회 실패');
    }
  }, [adminPassword]);

  /**
   * 프롬프트 목록 조회
   */
  const fetchPrompts = useCallback(
    async (categorySlug?: string) => {
      setLoading(true);
      setError(null);

      try {
        const url = categorySlug
          ? `/api/admin/prompts?category=${categorySlug}`
          : '/api/admin/prompts';

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error?.message || '프롬프트 조회 실패');
        }

        setPrompts(data.data.prompts);
      } catch (err) {
        console.error('프롬프트 조회 오류:', err);
        setError(err instanceof Error ? err.message : '프롬프트 조회 실패');
      } finally {
        setLoading(false);
      }
    },
    [adminPassword]
  );

  /**
   * 프롬프트 수정
   */
  const updatePrompt = useCallback(
    async (id: string, updates: { content?: string; is_active?: boolean }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/prompts/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates),
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error?.message || '프롬프트 수정 실패');
        }

        // 로컬 상태 업데이트
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
    [adminPassword]
  );

  /**
   * 프롬프트 삭제
   */
  const deletePrompt = useCallback(
    async (id: string) => {
      if (!confirm('정말 삭제하시겠습니까?')) return false;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/prompts/${id}`, {
          method: 'DELETE',
          headers,
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error?.message || '프롬프트 삭제 실패');
        }

        // 로컬 상태 업데이트
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
    [adminPassword]
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
