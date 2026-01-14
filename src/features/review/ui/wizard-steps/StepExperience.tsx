import type { ChangeEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';

interface StepExperienceProps {
  form: ReviewPayload;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAppendDraft: (text: string) => void;
}

const KEYWORD_CHIPS = [
  '분위기가 깡패예요 ✨',
  '가성비가 좋아요 💰',
  '직원이 친절해요 😊',
  '사진이 잘 나와요 📸',
  '웨이팅이 있어요 ⏳',
  '주차가 편해요 🚗',
  '양이 정말 많아요 🍜',
  '재료가 신선해요 🥬',
  '특별한 날 가기 좋아요 🎉',
  '혼밥하기 좋아요 🍚',
];

export const StepExperience = ({
  form,
  onChange,
  onAppendDraft,
}: StepExperienceProps) => {
  const draftLength = form.user_draft?.length || 0;
  const minRecommended = 30;
  const isShort = draftLength > 0 && draftLength < minRecommended;

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='text-center space-y-3 mb-8'>
        <div className='inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-2'>
          <span className='text-white font-bold text-sm'>
            ⭐ 가장 중요한 단계입니다 (필수!)
          </span>
        </div>
        <h2 className='text-3xl font-bold text-gray-900'>
          어떤 점이 기억에 남으세요? <span className='text-red-500'>*</span>
        </h2>
        <p className='text-gray-500 text-lg'>
          키워드를 선택하거나, 의식의 흐름대로 편하게 적어주세요.
        </p>
      </div>

      <div className='flex flex-wrap justify-center gap-2 mb-6'>
        {KEYWORD_CHIPS.map((chip) => (
          <button
            key={chip}
            type='button'
            onClick={() => onAppendDraft(chip)}
            className='px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm'
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Writing Guide */}
      <div className='bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-2xl p-6 shadow-sm'>
        <p className='text-base text-orange-900 font-bold mb-3 flex items-center gap-2'>
          <span className='text-2xl'>✍️</span>
          작성 팁 - 이렇게 작성하면 최고의 리뷰가 만들어져요!
        </p>
        <ul className='text-sm text-orange-800 space-y-2'>
          <li className='flex items-start gap-2'>
            <span className='text-orange-500 font-bold mt-0.5'>•</span>
            <span>
              <strong>완벽한 문장이 아니어도 괜찮아요!</strong> (예:
              &ldquo;파스타 좀 짰음, 근데 맛남&rdquo;)
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-orange-500 font-bold mt-0.5'>•</span>
            <span>
              <strong>맛, 양, 식감, 분위기, 서비스</strong> 등 떠오르는 대로
              자유롭게 적어주세요
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-orange-500 font-bold mt-0.5'>•</span>
            <span>
              AI가 여러분의 경험을 <strong>1500자 이상의 생생한 리뷰</strong>로
              확장합니다
            </span>
          </li>
          <li className='flex items-start gap-2'>
            <span className='text-orange-500 font-bold mt-0.5'>•</span>
            <span className='text-orange-900 font-semibold'>
              최소 30자 이상 작성을 권장드려요! 📝
            </span>
          </li>
        </ul>
      </div>

      {/* Character Counter */}
      <div className='flex justify-between items-center text-sm'>
        <span
          className={`font-medium ${
            draftLength === 0
              ? 'text-red-500'
              : isShort
              ? 'text-orange-600'
              : 'text-green-600'
          }`}
        >
          {draftLength === 0 ? (
            <>⚠️ 필수 항목입니다 - 경험을 작성해주세요!</>
          ) : isShort ? (
            <>
              ⚠️ {draftLength}자 (최소 {minRecommended}자 이상 권장)
            </>
          ) : (
            <>✅ {draftLength}자 (충분해요!)</>
          )}
        </span>
        <span className='text-gray-400'>AI가 10배 이상 확장해드려요 ✨</span>
      </div>

      {/* Enhanced Textarea */}
      <div className='relative group'>
        <div className='absolute -inset-1 bg-gradient-to-r from-orange-300 via-pink-300 to-rose-300 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300'></div>
        <textarea
          id='user_draft'
          value={form.user_draft || ''}
          onChange={onChange('user_draft')}
          placeholder='예: 창가 자리에 앉았는데 노을이 너무 예뻤음. 파스타는 좀 짰는데 스테이크는 입에서 살살 녹음. 사장님이 서비스로 주신 샐러드도 맛있었음. 분위기 진짜 좋아서 데이트하기 딱 좋았음...'
          className='relative w-full h-96 p-6 rounded-xl bg-white border-2 border-gray-200 text-lg leading-relaxed focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none resize-none shadow-lg transition-all'
          autoFocus
        />
      </div>

      {/* Encouragement Message */}
      {isShort && (
        <div className='bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg animate-in slide-in-from-top-2 duration-300'>
          <p className='text-sm text-orange-800 font-medium'>
            💡 조금만 더 자세히 적어주시면 훨씬 생생한 리뷰가 완성돼요!
            <br />
            <span className='text-orange-900 font-semibold'>
              예: 맛은 어땠나요? 분위기는요? 서비스는요?
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
