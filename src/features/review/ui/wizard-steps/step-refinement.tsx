import type { ChangeEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';

interface StepRefinementProps {
  form: ReviewPayload;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const StepRefinement = ({ form, onChange }: StepRefinementProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-bold text-gray-900">
          마지막으로 정리해볼까요?
        </h2>
        <p className="text-gray-500">
          AI가 글을 완성하기 위해 필요한 마지막 정보입니다.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="menu" className="block text-lg font-medium text-gray-700">
            어떤 메뉴를 드셨나요?
          </label>
          <input
            id="menu"
            value={form.menu}
            onChange={onChange('menu')}
            placeholder="예: 고등어 봉초밥, 유자 하이볼"
            className="w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300"
          />
          <p className="text-sm text-gray-400">
            * 정확한 가격 정보 검색을 위해 메뉴명은 정확히 적어주세요.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="summary" className="block text-lg font-medium text-gray-700">
            한 줄로 요약한다면? (제목으로 쓰여요)
          </label>
          <input
            id="summary"
            value={form.summary}
            onChange={onChange('summary')}
            placeholder="예: 분위기 깡패, 데이트 코스로 강추!"
            className="w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300"
          />
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="space-y-2">
            <label htmlFor="extra" className="block text-lg font-medium text-gray-700">
              혹시 덧붙일 꿀팁이 있나요? (선택)
            </label>
            <textarea
              id="extra"
              value={form.extra || ''}
              onChange={onChange('extra')}
              placeholder="예: 주말엔 웨이팅 필수, 캐치테이블 예약 추천"
              className="w-full p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-100 resize-none h-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
