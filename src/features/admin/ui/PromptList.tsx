'use client';

import { useState } from 'react';
import type { Prompt, PromptCategory } from '../model/usePrompts';
import { PromptEditor } from './PromptEditor';

type Props = {
  prompts: Prompt[];
  categories: PromptCategory[];
  loading: boolean;
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  onUpdate: (
    id: string,
    updates: { content?: string; is_active?: boolean }
  ) => Promise<boolean>;
  onRefresh: () => void;
};

export const PromptList = ({
  prompts,
  categories,
  loading,
  selectedCategory,
  onCategoryChange,
  onUpdate,
  onRefresh,
}: Props) => {
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const handleSave = async (content: string, isActive: boolean) => {
    if (!editingPrompt) return;

    const success = await onUpdate(editingPrompt.id, {
      content,
      is_active: isActive,
    });

    if (success) {
      setEditingPrompt(null);
    }
  };

  return (
    <div>
      {/* 카테고리 필터 */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">카테고리:</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">전체</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.display_name}
            </option>
          ))}
        </select>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? '로딩...' : '새로고침'}
        </button>
      </div>

      {/* 프롬프트 목록 */}
      {loading && prompts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">로딩 중...</div>
      ) : prompts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          프롬프트가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`rounded-lg border bg-white p-4 shadow-sm ${
                !prompt.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* 헤더 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {prompt.prompt_key}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      prompt.role === 'system'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {prompt.role}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {prompt.category.display_name}
                  </span>
                  {!prompt.is_active && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      비활성
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingPrompt(prompt)}
                  className="rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                >
                  편집
                </button>
              </div>

              {/* 내용 미리보기 */}
              <div className="rounded-md bg-gray-50 p-3">
                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-600">
                  {prompt.content.length > 300
                    ? prompt.content.slice(0, 300) + '...'
                    : prompt.content}
                </pre>
              </div>

              {/* 메타 정보 */}
              <div className="mt-2 text-xs text-gray-400">
                v{prompt.version} | {prompt.content.length}자 | 수정:{' '}
                {new Date(prompt.updated_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 편집 모달 */}
      {editingPrompt && (
        <PromptEditor
          prompt={editingPrompt}
          onSave={handleSave}
          onClose={() => setEditingPrompt(null)}
          loading={loading}
        />
      )}
    </div>
  );
};
