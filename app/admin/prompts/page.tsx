'use client';

import { useEffect, useState } from 'react';
import { useAdminAuthContext, usePrompts } from '@/features/admin/model';
import { PromptList } from '@/features/admin/ui';

export default function AdminPromptsPage() {
  const { password } = useAdminAuthContext();
  const { prompts, categories, loading, error, fetchCategories, fetchPrompts, updatePrompt } =
    usePrompts(password);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchPrompts();
  }, [fetchCategories, fetchPrompts]);

  useEffect(() => {
    fetchPrompts(selectedCategory || undefined);
  }, [selectedCategory, fetchPrompts]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-stone-900">프롬프트 관리</h2>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <PromptList
        prompts={prompts}
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onUpdate={updatePrompt}
        onRefresh={() => fetchPrompts(selectedCategory || undefined)}
      />
    </div>
  );
}
