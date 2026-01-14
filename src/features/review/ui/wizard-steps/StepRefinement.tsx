import { useState, type ChangeEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';

interface StepRefinementProps {
  form: ReviewPayload;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PROS_OPTIONS = [
  '가성비 👍',
  '분위기 ✨',
  '맛 😋',
  '서비스 🙏',
  '주차 🚗',
  '접근성 🚶',
];

const CONS_OPTIONS = [
  '웨이팅 ⏰',
  '주차 어려움 🚫',
  '가격대 💸',
  '양 적음 🍽️',
  '시끄러움 📢',
];

export const StepRefinement = ({ form, onChange }: StepRefinementProps) => {
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [selectedCons, setSelectedCons] = useState<string[]>([]);

  const togglePros = (option: string) => {
    const newSelected = selectedPros.includes(option)
      ? selectedPros.filter((item) => item !== option)
      : [...selectedPros, option];
    setSelectedPros(newSelected);

    const event = {
      target: { value: newSelected.join(', ') },
    } as ChangeEvent<HTMLInputElement>;
    onChange('pros')(event);
  };

  const toggleCons = (option: string) => {
    const newSelected = selectedCons.includes(option)
      ? selectedCons.filter((item) => item !== option)
      : [...selectedCons, option];
    setSelectedCons(newSelected);

    const event = {
      target: { value: newSelected.join(', ') },
    } as ChangeEvent<HTMLInputElement>;
    onChange('cons')(event);
  };

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='text-center space-y-2 mb-10'>
        <h2 className='text-2xl font-bold text-gray-900'>
          마지막으로 평가해볼까요?
        </h2>
        <p className='text-gray-500'>
          이 단계는{' '}
          <span className='font-semibold text-blue-600'>선택 사항</span>입니다.
          건너뛰어도 괜찮아요!
        </p>
        <p className='text-sm text-gray-400'>
          💡 장단점을 적으면 더 신뢰감 있는 리뷰가 되지만, AI가 자동으로 작성할
          수도 있어요.
        </p>
      </div>

      <div className='space-y-8'>
        {/* Pros */}
        <div className='space-y-3'>
          <label className='block text-lg font-medium text-gray-700'>
            좋았던 점은? (여러 개 선택 가능)
          </label>
          <div className='flex flex-wrap gap-2'>
            {PROS_OPTIONS.map((option) => (
              <button
                key={option}
                type='button'
                onClick={() => togglePros(option)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedPros.includes(option)
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <input
            value={form.pros || ''}
            onChange={onChange('pros')}
            placeholder='추가로 적고 싶은 장점이 있나요?'
            className='w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none placeholder:text-gray-400'
          />
        </div>

        {/* Cons */}
        <div className='space-y-3'>
          <label className='block text-lg font-medium text-gray-700'>
            아쉬웠던 점은? (솔직하게!)
          </label>
          <div className='flex flex-wrap gap-2'>
            {CONS_OPTIONS.map((option) => (
              <button
                key={option}
                type='button'
                onClick={() => toggleCons(option)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCons.includes(option)
                    ? 'bg-orange-100 border-2 border-orange-500 text-orange-700'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <input
            value={form.cons || ''}
            onChange={onChange('cons')}
            placeholder='추가로 적고 싶은 단점이 있나요?'
            className='w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none placeholder:text-gray-400'
          />
        </div>

        {/* Summary */}
        <div className='space-y-2 pt-4 border-t border-gray-100'>
          <label
            htmlFor='summary'
            className='block text-lg font-medium text-gray-700'
          >
            한 줄로 요약한다면?{' '}
            <span className='text-gray-400 text-sm'>(선택)</span>
          </label>
          <p className='text-sm text-gray-500 mb-2'>
            비워두면 AI가 자동으로 제목을 만들어드려요
          </p>
          <input
            id='summary'
            value={form.summary}
            onChange={onChange('summary')}
            placeholder='예: 분위기 깡패, 데이트 코스로 강추!'
            className='w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300'
          />
        </div>

        {/* Extra */}
        <div className='space-y-2'>
          <label
            htmlFor='extra'
            className='block text-lg font-medium text-gray-700'
          >
            혹시 덧붙일 꿀팁이 있나요? (선택)
          </label>
          <textarea
            id='extra'
            value={form.extra || ''}
            onChange={onChange('extra')}
            placeholder='예: 주말엔 웨이팅 필수, 캐치테이블 예약 추천'
            className='w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none h-24'
          />
        </div>
      </div>
    </div>
  );
};
