import type { ChangeEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';

interface StepContextProps {
  form: ReviewPayload;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const StepContext = ({ form, onChange }: StepContextProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-bold text-gray-900">
          어디를 다녀오셨나요?
        </h2>
        <p className="text-gray-500">
          리뷰의 기본이 되는 정보를 알려주세요.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-lg font-medium text-gray-700">
            가게 이름이 뭔가요?
          </label>
          <input
            id="name"
            value={form.name}
            onChange={onChange('name')}
            placeholder="예: 오이도 조개92"
            className="w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-lg font-medium text-gray-700">
            어느 지역에 있나요?
          </label>
          <input
            id="location"
            value={form.location}
            onChange={onChange('location')}
            placeholder="예: 시흥 오이도, 서울 강남역"
            className="w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-lg font-medium text-gray-700">
              언제 가셨나요?
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={onChange('date')}
              className="w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="companion" className="block text-lg font-medium text-gray-700">
              누구와 함께였나요?
            </label>
            <input
              id="companion"
              value={form.companion}
              onChange={onChange('companion')}
              placeholder="예: 친구, 연인, 가족"
              className="w-full p-4 text-xl border-b-2 border-gray-200 bg-transparent focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
