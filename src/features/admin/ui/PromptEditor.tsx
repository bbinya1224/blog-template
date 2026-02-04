'use client';

import { useState } from 'react';
import type { Prompt } from '../model/usePrompts';

type Props = {
  prompt: Prompt;
  onSave: (content: string, isActive: boolean) => void;
  onClose: () => void;
  loading: boolean;
};

export const PromptEditor = ({ prompt, onSave, onClose, loading }: Props) => {
  const [content, setContent] = useState(prompt.content);
  const [isActive, setIsActive] = useState(prompt.is_active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(content, isActive);
  };

  const hasChanges =
    content !== prompt.content || isActive !== prompt.is_active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-4xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">프롬프트 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="border-b bg-gray-50 px-6 py-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">Key:</span>{' '}
                <span className="font-mono font-medium">
                  {prompt.prompt_key}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>{' '}
                <span
                  className={`rounded px-1.5 py-0.5 text-xs ${
                    prompt.role === 'system'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {prompt.role}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>{' '}
                <span>{prompt.category.display_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Version:</span>{' '}
                <span>{prompt.version}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-96 w-full rounded-md border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="프롬프트 내용을 입력하세요..."
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {content.length}자
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">활성화</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">
                비활성화하면 이 프롬프트는 API에서 사용되지 않습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
