'use client';

import { cn, formatReviewDate } from '@/shared/lib/utils';
import Link from 'next/link';
import type { ChatMessage } from '@/entities/chat-message';
import type { StyleProfile } from '@/entities/style-profile';
import type { Review } from '@/entities/review';
import { MessageList } from '@/entities/chat-message';
import { InputArea } from '@/shared/ui/InputArea';
import { MESSAGES, WelcomeScreen } from '@/features/chat-review';
import { useScrollToBottom } from '@/shared/lib/hooks';
import { Utensils } from 'lucide-react';

const REVIEW_HEADER_TITLES: Record<string, string> = {
  restaurant: '맛집 리뷰 작성중',
  beauty: '나의 뷰티 기록 작성중',
  product: '제품 리뷰 작성중',
  movie: '영화 리뷰 작성중',
  book: '독서 기록 작성중',
  travel: '여행 기록 작성중',
};

const REVIEW_ICONS: Record<string, React.ReactNode> = {
  restaurant: <Utensils />,
};

interface ChatContainerProps {
  messages: ChatMessage[];
  currentStep?: string;
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
  const { containerRef } = useScrollToBottom<HTMLDivElement>();

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Review type header */}
      {hasMessages && selectedTopic && (
        <div className='flex shrink-0 items-center gap-2 px-6 py-3'>
          <span className='text-orange-400'>{REVIEW_ICONS[selectedTopic]}</span>
          <h2 className='text-sm font-semibold text-stone-700'>
            {REVIEW_HEADER_TITLES[selectedTopic] ?? '리뷰 작성중'}
          </h2>
        </div>
      )}

      {/* Main scrollable content */}
      <div ref={containerRef} className='min-h-0 flex-1 overflow-y-auto'>
        <div className='mx-auto flex size-full max-w-3xl flex-col'>
          {!hasMessages ? (
            <WelcomeScreen
              userName={userName}
              hasExistingStyle={hasExistingStyle}
              styleProfile={styleProfile}
              onCategorySelect={onCategorySelect}
            />
          ) : (
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
            sendAriaLabel={MESSAGES.input.sendLabel}
            tagline={MESSAGES.input.tagline}
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
