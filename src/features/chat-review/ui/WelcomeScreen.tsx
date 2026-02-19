'use client';

import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import type { StyleProfile } from '@/entities/style-profile';
import { Utensils, ShoppingCart, Sparkles, Paintbrush, BookOpen } from 'lucide-react';
import { OrotiLogo } from '@/shared/ui/Icons';
import { MESSAGES, CATEGORY_LABELS } from '../constants/messages';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
}

const REVIEW_CATEGORIES: CategoryOption[] = [
  {
    id: 'restaurant',
    label: CATEGORY_LABELS.restaurant,
    icon: <Utensils />,
  },
  {
    id: 'product',
    label: CATEGORY_LABELS.product,
    icon: <ShoppingCart />,
    disabled: true,
    disabledLabel: CATEGORY_LABELS.comingSoon,
  },
  {
    id: 'beauty',
    label: CATEGORY_LABELS.beauty,
    icon: <Paintbrush />,
    disabled: true,
    disabledLabel: CATEGORY_LABELS.comingSoon,
  },
  {
    id: 'book',
    label: CATEGORY_LABELS.book,
    icon: <BookOpen />,
    disabled: true,
    disabledLabel: CATEGORY_LABELS.comingSoon,
  },
];

interface WelcomeScreenProps {
  userName?: string;
  hasExistingStyle?: boolean;
  styleProfile?: StyleProfile | null;
  onCategorySelect?: (categoryId: string) => void;
}

export function WelcomeScreen({
  userName,
  hasExistingStyle,
  styleProfile,
  onCategorySelect,
}: WelcomeScreenProps) {
  const handleCategoryClick = (category: CategoryOption) => {
    if (category.disabled) return;
    onCategorySelect?.(category.id);
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center px-6 py-8'>
      <div className='mb-6'>
        <OrotiLogo className='size-16' />
      </div>

      <h1 className='mb-2 text-2xl font-semibold text-stone-800 sm:text-3xl'>
        {MESSAGES.welcome.greeting(userName)}
      </h1>
      <p className='mb-10 text-lg text-stone-400'>
        {MESSAGES.welcome.subtitle}
      </p>

      <div className='flex flex-wrap justify-center gap-3'>
        {REVIEW_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            disabled={category.disabled}
            className={cn(
              'group flex items-center gap-2.5 px-5 py-3',
              'rounded-2xl border transition-all duration-200',
              category.disabled
                ? 'cursor-not-allowed border-stone-100 bg-stone-50/50 text-stone-300'
                : 'border-stone-200 bg-white text-stone-700 shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
            )}
          >
            <span
              className={cn(
                'transition-colors',
                category.disabled
                  ? 'text-stone-300'
                  : 'text-primary group-hover:text-primary-hover',
              )}
            >
              {category.icon}
            </span>
            <span className='font-medium'>{category.label}</span>
            {category.disabled && category.disabledLabel && (
              <span className='ml-1 text-xs text-stone-300'>
                ({category.disabledLabel})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className='mt-10 w-full max-w-lg break-keep'>
        <div className='border-t border-stone-100 pt-6'>
          {hasExistingStyle && styleProfile ? (
            <div className='rounded-2xl border border-stone-100 bg-linear-to-br from-white to-surface/50 p-4'>
              <div className='mb-2 flex items-center gap-2'>
                <Sparkles className='size-4 text-primary' />
                <span className='text-sm font-medium text-stone-700'>
                  {MESSAGES.welcome.styleLabel}
                </span>
              </div>
              <p className='text-sm/relaxed text-stone-500'>
                {styleProfile.writing_style?.tone || '친근한 톤'}
                {' · '}
                이모지{' '}
                {styleProfile.writing_style?.emoji_usage || '적당히 사용'}
              </p>
              <Link
                href='/analyze-style'
                className='mt-2 inline-block text-xs text-primary transition-colors hover:text-primary-hover'
              >
                {MESSAGES.welcome.detailLink}
              </Link>
            </div>
          ) : (
            <div className='text-center'>
              <p className='mb-3 text-sm text-stone-400'>
                {MESSAGES.welcome.noStyleMessage}
              </p>
              <Link
                href='/analyze-style'
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5',
                  'rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-600',
                  'transition-all duration-200 hover:border-primary/40 hover:text-primary',
                )}
              >
                <Sparkles className='size-4' />{MESSAGES.welcome.analyzeStyleLink}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
