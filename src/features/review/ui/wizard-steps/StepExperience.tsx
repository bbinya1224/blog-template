import type { ChangeEvent } from 'react';
import type { ReviewPayload } from '@/shared/types/review';
import {
  KEYWORD_CHIPS,
  STEP_EXPERIENCE_MESSAGES as MSG,
} from '../../constants/messages';

interface StepExperienceProps {
  form: ReviewPayload;
  onChange: (
    field: keyof ReviewPayload,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAppendDraft: (text: string) => void;
}

export function StepExperience({
  form,
  onChange,
  onAppendDraft,
}: StepExperienceProps) {
  const draftLength = form.user_draft?.length || 0;
  const minRecommended = 30;
  const isShort = draftLength > 0 && draftLength < minRecommended;

  return (
    <div className='animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500'>
      <div className='mb-8 space-y-3 text-center'>
        <div className='mb-2 inline-block rounded-full bg-linear-to-r from-orange-500 to-pink-500 px-4 py-2'>
          <span className='text-sm font-bold text-white'>{MSG.badge}</span>
        </div>
        <h2 className='text-3xl font-bold text-gray-900'>
          {MSG.title} <span className='text-red-500'>*</span>
        </h2>
        <p className='text-lg text-gray-500'>{MSG.subtitle}</p>
      </div>

      <div className='mb-6 flex flex-wrap justify-center gap-2'>
        {KEYWORD_CHIPS.map((chip) => (
          <button
            key={chip}
            type='button'
            onClick={() => onAppendDraft(chip)}
            className='rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 active:scale-95'
          >
            {chip}
          </button>
        ))}
      </div>

      <div className='rounded-2xl border-2 border-orange-200 bg-linear-to-br from-orange-50 to-pink-50 p-6 shadow-sm'>
        <p className='mb-3 flex items-center gap-2 text-base font-bold text-orange-900'>
          {MSG.tipTitle}
        </p>
        <ul className='space-y-2 text-sm text-orange-800'>
          {MSG.tips.map((tip, i) => (
            <li key={i} className='flex items-start gap-2'>
              <span className='mt-0.5 font-bold text-orange-500'>•</span>
              <span>
                {'prefix' in tip && tip.prefix}
                <strong>{tip.emphasis}</strong>
                {'example' in tip && ` ${tip.example}`}
                {'detail' in tip && tip.detail}
                {'suffix' in tip && tip.suffix}
              </span>
            </li>
          ))}
          <li className='flex items-start gap-2'>
            <span className='mt-0.5 font-bold text-orange-500'>•</span>
            <span className='font-semibold text-orange-900'>
              {MSG.minRecommended}
            </span>
          </li>
        </ul>
      </div>

      <div className='flex items-center justify-between text-sm'>
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
            <>{MSG.status.empty}</>
          ) : isShort ? (
            <>{MSG.status.short(draftLength, minRecommended)}</>
          ) : (
            <>{MSG.status.enough(draftLength)}</>
          )}
        </span>
        <span className='text-gray-400'>{MSG.expansion}</span>
      </div>

      <div className='group relative'>
        <div className='absolute -inset-1 rounded-2xl bg-linear-to-r from-orange-300 via-pink-300 to-rose-300 opacity-60 blur-sm transition duration-300 group-focus-within:opacity-100 group-hover:opacity-100'></div>
        <textarea
          id='user_draft'
          value={form.user_draft || ''}
          onChange={onChange('user_draft')}
          placeholder={MSG.placeholder}
          className='relative h-96 w-full resize-none rounded-xl border-2 border-gray-200 bg-white p-6 text-lg/relaxed shadow-lg transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none'
          autoFocus
        />
      </div>

      {isShort && (
        <div className='animate-in slide-in-from-top-2 rounded-r-lg border-l-4 border-orange-400 bg-orange-50 p-4 duration-300'>
          <p className='text-sm font-medium text-orange-800'>
            {MSG.shortWarning}
            <br />
            <span className='font-semibold text-orange-900'>
              {MSG.shortExample}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
