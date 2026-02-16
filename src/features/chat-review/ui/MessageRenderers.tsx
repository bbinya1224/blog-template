'use client';

import { cn } from '@/shared/lib/utils';
import type {
  ChatMessage,
  PlaceCardMetadata,
  StyleSummaryMetadata,
  ReviewPreviewMetadata,
} from '@/entities/chat-message';
import {
  isPlaceCardMessage,
  isStyleSummaryMessage,
  isReviewPreviewMessage,
} from '@/entities/chat-message';
import { ChoiceButtons } from './ChoiceButtons';
import { PlaceCard } from './PlaceCard';
import { StyleSummaryCard } from './StyleSummaryCard';
import { ReviewPreview } from './ReviewPreview';
import { useTypingEffect, useStreamingText } from '../model/useTextAnimation';

interface TextRendererProps {
  content: string;
  enableTyping?: boolean;
  isStreaming?: boolean;
}

export function TextRenderer({
  content,
  enableTyping = false,
  isStreaming = false,
}: TextRendererProps) {
  const { displayedText: typedText, isTyping } = useTypingEffect(
    content,
    enableTyping,
  );
  const { displayedText: streamedText, isAnimating } = useStreamingText(
    content,
    isStreaming,
  );

  const displayedText = isStreaming
    ? streamedText
    : enableTyping
      ? typedText
      : content;
  const showCursor = isStreaming ? isAnimating : isTyping;

  if (!content) return null;

  return (
    <p className='text-[15px] leading-7 break-keep whitespace-pre-wrap text-stone-700'>
      {displayedText}
      <span
        aria-hidden
        className={cn(
          'inline-block h-[1em] w-0.5 translate-y-[0.1em] bg-stone-400 transition-opacity duration-300',
          showCursor ? 'animate-pulse opacity-100' : 'opacity-0',
        )}
      />
    </p>
  );
}

export function ChoiceRenderer({
  options,
  onSelect,
}: {
  options: ChatMessage['options'];
  onSelect?: (id: string) => void;
}) {
  if (!options) return null;
  return <ChoiceButtons options={options} onSelect={onSelect} />;
}

export function PlaceCardRenderer({
  metadata,
  onConfirm,
}: {
  metadata: PlaceCardMetadata;
  onConfirm?: (confirmed: boolean) => void;
}) {
  return <PlaceCard metadata={metadata} onConfirm={onConfirm} />;
}

export function StyleSummaryRenderer({
  metadata,
}: {
  metadata: StyleSummaryMetadata;
}) {
  return <StyleSummaryCard metadata={metadata} />;
}

export function ReviewPreviewRenderer({
  metadata,
  onAction,
}: {
  metadata: ReviewPreviewMetadata;
  onAction?: (action: 'complete' | 'edit') => void;
}) {
  return <ReviewPreview metadata={metadata} onAction={onAction} />;
}

export function LoadingRenderer() {
  return (
    <div className='flex items-center gap-1.5'>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className='size-1.5 animate-bounce rounded-full bg-stone-400'
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function SummaryRenderer({
  metadata,
}: {
  metadata: Record<string, unknown>;
}) {
  if (!metadata) return null;

  return (
    <div className='space-y-2 rounded-xl bg-stone-50 p-4'>
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className='flex gap-2 text-sm'>
          <span className='text-stone-400'>{key}:</span>
          <span className='text-stone-600'>{String(value)}</span>
        </div>
      ))}
    </div>
  );
}

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
  const renderers: Record<string, () => React.ReactNode> = {
    text: () => (
      <TextRenderer
        content={message.content || ''}
        enableTyping={enableTyping}
        isStreaming={!!message.metadata?.streaming}
      />
    ),
    choice: () => (
      <>
        <TextRenderer content={message.content || ''} />
        <ChoiceRenderer options={message.options} onSelect={onChoiceSelect} />
      </>
    ),
    'place-card': () => {
      if (!isPlaceCardMessage(message)) return null;
      return (
        <PlaceCardRenderer
          metadata={message.metadata}
          onConfirm={onPlaceConfirm}
        />
      );
    },
    'style-summary': () => {
      if (!isStyleSummaryMessage(message)) return null;
      return (
        <>
          <TextRenderer content={message.content || ''} />
          <StyleSummaryRenderer metadata={message.metadata} />
          <ChoiceRenderer options={message.options} onSelect={onChoiceSelect} />
        </>
      );
    },
    'review-preview': () => {
      if (!isReviewPreviewMessage(message)) return null;
      return (
        <ReviewPreviewRenderer
          metadata={message.metadata}
          onAction={onReviewAction}
        />
      );
    },
    loading: () => <LoadingRenderer />,
    summary: () => (
      <>
        <TextRenderer content={message.content || ''} />
        {message.metadata && <SummaryRenderer metadata={message.metadata} />}
      </>
    ),
  };

  const render = renderers[message.type] || renderers.text;
  return <div className='space-y-3'>{render()}</div>;
}
