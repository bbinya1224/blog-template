'use client';

import { cn, formatReviewDate } from '@/shared/lib/utils';
import Link from 'next/link';
import type { ChatMessage } from '@/entities/chat-message';
import type { ConversationStep } from '../model/types';
import type { Review } from '@/entities/review';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

// Extensible category configuration
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
    label: '맛집',
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
          d='M3 3v6h3V3M9 3v18m0-18c0 3.314 2.686 6 6 6M21 3v6h-3V3m0 18v-8h3v8'
        />
      </svg>
    ),
  },
  {
    id: 'product',
    label: '제품',
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
          d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        />
      </svg>
    ),
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
    <div
      className={cn(
        'flex size-full flex-col',
        'md:mx-auto md:max-w-3xl',
        className,
      )}
    >
      {/* Main content area */}
      <div className='relative flex flex-1 flex-col overflow-hidden'>
        {/* Welcome content - animates out when messages appear */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center',
            'transition-all duration-500 ease-out',
            hasMessages
              ? 'pointer-events-none translate-y-8 opacity-0'
              : 'translate-y-0 opacity-100',
          )}
        >
          <div className='mb-8 text-center'>
            <h1 className='mb-2 text-2xl font-semibold text-stone-800 sm:text-3xl'>
              {userName ? `${userName}님, 안녕하세요` : '안녕하세요'}
            </h1>
            <p className='text-lg text-stone-400'>
              오늘은 어떤 경험을 남겨볼까요?
            </p>
          </div>

          {/* Category selection */}
          <div className='flex flex-wrap justify-center gap-3'>
            {REVIEW_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                disabled={category.disabled}
                className={cn(
                  'group flex items-center gap-2.5 px-5 py-3',
                  'rounded-xl border-2 transition-all duration-200',
                  category.disabled
                    ? `cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300`
                    : `border-stone-200 bg-white text-stone-700 hover:border-orange-300 hover:shadow-md hover:shadow-orange-100/50`,
                )}
              >
                <span
                  className={cn(
                    'transition-colors',
                    category.disabled
                      ? 'text-stone-300'
                      : `text-orange-400 group-hover:text-orange-500`,
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
        </div>

        {/* Message list - animates in when messages appear */}
        <div
          className={cn(
            'flex-1 transition-all duration-500 ease-out',
            hasMessages
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-4 opacity-0',
          )}
        >
          {hasMessages && (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              onChoiceSelect={onChoiceSelect}
              onPlaceConfirm={onPlaceConfirm}
              onReviewAction={onReviewAction}
              className='h-full'
            />
          )}
        </div>
      </div>

      {/* Input area - always at bottom */}
      <InputArea
        onSend={onSendMessage}
        disabled={isInputDisabled || isTyping}
        placeholder={inputPlaceholder}
      />

      {/* Recent reviews - only render when no messages */}
      {!hasMessages && recentReviews.length > 0 && (
        <div className='border-t border-stone-100 px-6 pb-6'>
          <div className='flex items-center justify-between py-4'>
            <h2 className='text-sm font-medium text-stone-500'>
              최근에는 이런 리뷰를 작성했어요.
            </h2>
            <Link
              href='/reviews'
              className='text-sm font-medium text-orange-500 transition-colors hover:text-orange-600'
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
                  'hover:border-orange-300 hover:shadow-md',
                  'transition-all duration-200',
                )}
              >
                <h3 className='mb-1 truncate text-sm font-semibold text-stone-800 transition-colors group-hover:text-orange-600'>
                  {review.storeName || '맛집 리뷰'}
                </h3>
                <p className='text-xs text-stone-400'>
                  {formatReviewDate(review.date)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
