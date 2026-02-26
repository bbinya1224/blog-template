'use client';

import type { ReactNode } from 'react';
import type { ChatMessage, MessageType } from '../model/types';
import { isPlaceCardMessage, isReviewPreviewMessage } from '../model/types';
import { TextRenderer } from './TextRenderer';
import { StyleSummaryRenderer } from './StyleSummaryRenderer';
import { PlaceCard } from './PlaceCard';
import { ReviewPreview } from './ReviewPreview';
import { ChoiceButtons } from '@/shared/ui/ChoiceButtons';

const METADATA_LABELS: Record<string, string> = {
  name: '가게 이름',
  location: '위치',
  date: '방문 날짜',
  menu: '메뉴',
  companion: '동행',
  pros: '좋았던 점',
  cons: '아쉬운 점',
  extra: '기타',
  title: '제목',
  author: '저자',
  readDate: '읽은 날짜',
  genre: '장르',
};

interface MessageContentProps {
  message: ChatMessage;
  enableTyping?: boolean;
  onChoiceSelect?: (id: string) => void;
  onPlaceConfirm?: (confirmed: boolean) => void;
  onReviewAction?: (action: 'complete' | 'edit') => void;
}

export function MessageContent({
  message,
  enableTyping = false,
  onChoiceSelect,
  onPlaceConfirm,
  onReviewAction,
}: MessageContentProps) {
  const renderers: Partial<Record<MessageType, () => ReactNode>> = {
    text: () => (
      <TextRenderer
        content={message.content || ''}
        enableTyping={enableTyping}
        isStreaming={!!message.metadata?.streaming}
      />
    ),
    choice: () => (
      <>
        <TextRenderer
          content={message.content || ''}
          enableTyping={enableTyping}
        />
        {message.options && (
          <ChoiceButtons options={message.options} onSelect={onChoiceSelect} />
        )}
      </>
    ),
    'place-card': () => {
      if (!isPlaceCardMessage(message)) return null;
      return (
        <PlaceCard metadata={message.metadata} onConfirm={onPlaceConfirm} />
      );
    },
    'style-summary': () => (
      <StyleSummaryRenderer
        message={message}
        enableTyping={enableTyping}
        onChoiceSelect={onChoiceSelect}
      />
    ),
    'review-preview': () => {
      if (!isReviewPreviewMessage(message)) return null;
      return (
        <ReviewPreview metadata={message.metadata} onAction={onReviewAction} />
      );
    },
    loading: () => (
      <div className='flex items-center gap-1.5'>
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className='size-1.5 animate-bounce rounded-full bg-stone-400'
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    ),
    summary: () => (
      <>
        <TextRenderer content={message.content || ''} />
        {message.metadata && (
          <div className='space-y-2 rounded-xl bg-stone-50 p-4'>
            {Object.entries(message.metadata)
              .filter(
                ([key, value]) =>
                  key !== 'formattedSummary' &&
                  key !== 'user_draft' &&
                  (typeof value === 'string' || typeof value === 'number'),
              )
              .map(([key, value]) => (
                <div key={key} className='flex gap-2 text-sm'>
                  <span className='text-stone-400'>{METADATA_LABELS[key] ?? key}:</span>
                  <span className='text-stone-600'>{String(value)}</span>
                </div>
              ))}
          </div>
        )}
      </>
    ),
  };

  const render = renderers[message.type] ?? renderers.text!;
  return <div className='space-y-3'>{render()}</div>;
}
