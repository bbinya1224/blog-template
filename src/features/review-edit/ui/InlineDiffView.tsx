'use client';

import { calculateDiffStats } from '../lib/diffCalculator';
import { DiffHighlight } from './DiffHighlight';

interface InlineDiffViewProps {
  show: boolean;
  originalContent: string;
  editedContent: string;
  editRequest: string;
  onApply: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

/**
 * 리뷰 수정 전후를 비교하여 인라인으로 표시하는 컴포넌트
 * Side-by-Side 방식으로 수정 전/후를 나란히 보여줌
 */
export function InlineDiffView({
  show,
  originalContent,
  editedContent,
  editRequest,
  onApply,
  onRetry,
  onCancel,
}: InlineDiffViewProps) {
  const { added, removed, changed } = calculateDiffStats(
    originalContent,
    editedContent,
  );

  if (!show) return null;

  return (
    <div className='border-t pt-6 mt-6 animate-fade-in'>
      {/* 헤더 */}
      <div className='space-y-3 mb-6'>
        <h3 className='text-lg font-bold text-gray-900'>
          AI 수정 결과 미리보기
        </h3>
        <div className='bg-blue-50 rounded-lg p-3 text-sm text-blue-900'>
          <span className='font-medium'>요청: &quot;{editRequest}&quot;</span>
        </div>
      </div>

      {/* Side-by-Side Diff */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        {/* 수정 전 */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700 border-b pb-2'>
            수정 전
          </h4>
          <div className='bg-gray-50 rounded-lg p-4 text-sm leading-relaxed max-h-[400px] overflow-y-auto'>
            <DiffHighlight
              content={originalContent}
              newContent={editedContent}
              mode='before'
            />
          </div>
        </div>

        {/* 수정 후 */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700 border-b pb-2'>
            수정 후
          </h4>
          <div className='bg-gray-50 rounded-lg p-4 text-sm leading-relaxed max-h-[400px] overflow-y-auto'>
            <DiffHighlight
              content={editedContent}
              oldContent={originalContent}
              mode='after'
            />
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className='flex items-center gap-4 text-xs text-gray-600 mb-6 border-t pt-3'>
        <span>변경사항: {changed}곳</span>
        <span className='text-green-600'>+{added}자 추가</span>
        <span className='text-red-600'>-{removed}자 삭제</span>
      </div>

      {/* 액션 버튼 */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <button
          type='button'
          onClick={onRetry}
          aria-label='AI 수정 다시 요청하기'
          className='flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition'
        >
          다시 요청하기
        </button>
        <button
          type='button'
          onClick={onCancel}
          aria-label='AI 수정 취소'
          className='flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition'
        >
          취소
        </button>
        <button
          type='button'
          onClick={onApply}
          aria-label='AI 수정 내용 적용하기'
          className='flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition shadow-lg'
        >
          적용하기
        </button>
      </div>
    </div>
  );
}
