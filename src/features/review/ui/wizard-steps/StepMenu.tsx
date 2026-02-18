import type { ChangeEvent } from 'react';
import type { ReviewPayload } from '@/shared/types/review';
import { COMPANION_OPTIONS, STEP_MENU_MESSAGES as MSG } from '../../constants/messages';

interface StepMenuProps {
  form: ReviewPayload;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function StepMenu({ form, onChange }: StepMenuProps) {
  const handleCompanionSelect = (value: string) => {
    const event = {
      target: { value },
    } as ChangeEvent<HTMLInputElement>;
    onChange('companion')(event);
  };

  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='text-center space-y-2 mb-10'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {MSG.title}
        </h2>
        <p className='text-gray-500'>{MSG.subtitle}</p>
      </div>

      <div className='space-y-8'>
        <div className='space-y-3'>
          <label className='block text-lg font-medium text-gray-700'>
            {MSG.companionLabel}
          </label>
          <div className='flex flex-wrap gap-3'>
            {COMPANION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => handleCompanionSelect(option.value)}
                className={`px-6 py-3 rounded-xl border-2 transition-all text-base font-medium ${
                  form.companion === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <span className='mr-2'>{option.emoji}</span>
                {option.value}
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-3'>
          <label
            htmlFor='menu'
            className='block text-lg font-medium text-gray-700'
          >
            {MSG.menuLabel} <span className='text-red-500'>*</span>
          </label>

          <input
            id='menu'
            value={form.menu}
            onChange={onChange('menu')}
            placeholder={MSG.menuPlaceholder}
            className='w-full p-4 text-xl border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-gray-300'
          />
          <p className='text-sm text-gray-500'>
            {MSG.menuHelp}
          </p>
        </div>
      </div>
    </div>
  );
}
