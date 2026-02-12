'use client';

import { cn, formatReviewDate } from '@/shared/lib/utils';
import Link from 'next/link';
import type { ChatMessage } from '@/entities/chat-message';
import type { ConversationStep } from '../model/types';
import type { StyleProfile } from '@/entities/style-profile';
import type { Review } from '@/entities/review';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { Utensils, ShoppingCart, Sparkles } from 'lucide-react';
import { OrotiLogo } from '@/shared/ui/Icons';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
}

const REVIEW_HEADER_TITLES: Record<string, string> = {
  restaurant: '맛집 리뷰 작성중',
  beauty: '나의 뷰티 기록 작성중',
  product: '제품 리뷰 작성중',
  movie: '영화 리뷰 작성중',
  book: '독서 기록 작성중',
  travel: '여행 기록 작성중',
};

const REVIEW_CATEGORIES: CategoryOption[] = [
  {
    id: 'restaurant',
    label: '맛집',
    icon: <Utensils />,
  },
  {
    id: 'product',
    label: '제품',
    icon: <ShoppingCart />,
    disabled: true,
    disabledLabel: '준비중',
  },
  {
    id: 'beauty',
    label: '뷰티',
    icon: (
      <svg
        className='size-5'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
        />
      </svg>
    ),
    disabled: true,
    disabledLabel: '준비중',
  },
  {
    id: 'book',
    label: '독서',
    icon: (
      <svg
        className='size-5'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
        />
      </svg>
    ),
    disabled: true,
    disabledLabel: '준비중',
  },
];

interface ChatContainerProps {
  messages: ChatMessage[];
  currentStep: ConversationStep;
  isTyping?: boolean;
  isInputDisabled?: boolean;
  inputPlaceholder?: string;
  onSendMessage: (message: string) => void;
  onChoiceSelect?: (messageId: string, optionId: string) => void;
  onPlaceConfirm?: (messageId: string, confirmed: boolean) => void;
  onReviewAction?: (messageId: string, action: 'complete' | 'edit') => void;
  onCategorySelect?: (categoryId: string) => void;
  hasExistingStyle?: boolean;
  styleProfile?: StyleProfile | null;
  selectedTopic?: string | null;
  recentReviews?: Review[];
  userName?: string;
  className?: string;
}

export function ChatContainer({
  messages,
  currentStep: _currentStep,
  isTyping,
  isInputDisabled,
  inputPlaceholder,
  onSendMessage,
  onChoiceSelect,
  onPlaceConfirm,
  onReviewAction,
  onCategorySelect,
  hasExistingStyle,
  styleProfile,
  selectedTopic,
  recentReviews = [],
  userName,
  className,
}: ChatContainerProps) {
  const hasMessages = messages.length > 0;

  const handleCategoryClick = (category: CategoryOption) => {
    if (category.disabled) return;
    onCategorySelect?.(category.id);
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Review type header */}
      {hasMessages && selectedTopic && (
        <div className='flex shrink-0 items-center gap-2 px-6 py-3'>
          <span className='text-orange-400'>
            {REVIEW_CATEGORIES.find((c) => c.id === selectedTopic)?.icon}
          </span>
          <h2 className='text-sm font-semibold text-stone-700'>
            {REVIEW_HEADER_TITLES[selectedTopic] ?? '리뷰 작성중'}
          </h2>
        </div>
      )}

      {/* Main scrollable content */}
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='mx-auto flex size-full max-w-3xl flex-col'>
          {!hasMessages ? (
            /* ===== Claude-style Welcome Screen ===== */
            <div className='flex flex-1 flex-col items-center justify-center px-6 py-8'>
              {/* Brand icon - large */}
              <div className='mb-6'>
                <OrotiLogo className='size-16' />
              </div>

              {/* Greeting */}
              <h1 className='mb-2 text-2xl font-semibold text-stone-800 sm:text-3xl'>
                {userName ? `${userName}님, 안녕하세요` : '안녕하세요'}
              </h1>
              <p className='mb-10 text-lg text-stone-400'>
                오늘은 어떤 경험을 남겨볼까요?
              </p>

              {/* Category chips - Claude prompt suggestion style */}
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
                        : 'border-stone-200 bg-white text-stone-700 shadow-sm hover:border-primary/40 hover:shadow-primary/5 hover:shadow-md',
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

              {/* Style analysis section */}
              <div className='mt-10 w-full max-w-lg break-keep'>
                <div className='border-t border-stone-100 pt-6'>
                  {hasExistingStyle && styleProfile ? (
                    <div className='rounded-2xl border border-stone-100 bg-linear-to-br from-white to-surface/50 p-4'>
                      <div className='mb-2 flex items-center gap-2'>
                        <Sparkles className='size-4 text-primary' />
                        <span className='text-sm font-medium text-stone-700'>
                          내 글 스타일
                        </span>
                      </div>
                      <p className='text-sm leading-relaxed text-stone-500'>
                        {styleProfile.writing_style?.tone || '친근한 톤'}
                        {' · '}
                        이모지{' '}
                        {styleProfile.writing_style?.emoji_usage ||
                          '적당히 사용'}
                      </p>
                      <Link
                        href='/analyze-style'
                        className='mt-2 inline-block text-xs text-primary transition-colors hover:text-primary-hover'
                      >
                        자세히 보기
                      </Link>
                    </div>
                  ) : (
                    <div className='text-center'>
                      <p className='mb-3 text-sm text-stone-400'>
                        아직 글 스타일을 분석하지 않으셨네요!
                      </p>
                      <Link
                        href='/analyze-style'
                        className={cn(
                          'inline-flex items-center gap-2 px-5 py-2.5',
                          'rounded-xl border border-stone-200 bg-white text-sm font-medium text-stone-600',
                          'transition-all duration-200 hover:border-primary/40 hover:text-primary',
                        )}
                      >
                        <Sparkles className='size-4' />내 글 스타일 분석하기
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ===== Message list ===== */
            <MessageList
              messages={messages}
              isTyping={isTyping}
              onChoiceSelect={onChoiceSelect}
              onPlaceConfirm={onPlaceConfirm}
              onReviewAction={onReviewAction}
            />
          )}
        </div>
      </div>

      {/* Input area - only when chat is active */}
      {hasMessages && (
        <div className='shrink-0'>
          <InputArea
            onSend={onSendMessage}
            disabled={isInputDisabled || isTyping}
            placeholder={inputPlaceholder}
          />
        </div>
      )}

      {/* Recent reviews - only render when no messages */}
      {!hasMessages && recentReviews.length > 0 && (
        <div className='shrink-0 border-t border-stone-100 px-6 pb-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='flex items-center justify-between py-4'>
              <h2 className='text-sm font-medium text-stone-500'>
                최근에는 이런 리뷰를 작성했어요.
              </h2>
              <Link
                href='/reviews'
                className='text-sm font-medium text-primary transition-colors hover:text-primary-hover'
              >
                전체보기
              </Link>
            </div>

            {/* Horizontal scroll cards */}
            <div className='scrollbar-hide -mx-6 flex gap-3 overflow-x-auto px-6 pb-2'>
              {recentReviews.slice(0, 6).map((review) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.id}`}
                  className={cn(
                    'group w-44 shrink-0 p-4',
                    'rounded-xl border border-stone-200',
                    'hover:border-primary/40 hover:shadow-md',
                    'transition-all duration-200',
                  )}
                >
                  <h3 className='mb-1 truncate text-sm font-semibold text-stone-800 transition-colors group-hover:text-primary'>
                    {review.storeName || '맛집 리뷰'}
                  </h3>
                  <p className='text-xs text-stone-400'>
                    {formatReviewDate(review.date)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
