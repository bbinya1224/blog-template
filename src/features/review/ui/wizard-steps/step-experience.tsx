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

export const StepExperience = ({ form, onChange, onAppendDraft }: StepExperienceProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          어떤 점이 기억에 남으세요?
        </h2>
        <p className="text-gray-500">
          키워드를 선택하거나, 의식의 흐름대로 편하게 적어주세요.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {KEYWORD_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onAppendDraft(chip)}
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
        <textarea
          id="user_draft"
          value={form.user_draft || ''}
          onChange={onChange('user_draft')}
          placeholder="예: 창가 자리에 앉았는데 노을이 너무 예뻤음. 파스타는 좀 짰는데 스테이크는 입에서 살살 녹음. 사장님이 서비스로 주신 샐러드도 맛있었음..."
          className="relative w-full h-80 p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-lg leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none shadow-inner transition-all"
        />
      </div>
    </div>
  );
};
