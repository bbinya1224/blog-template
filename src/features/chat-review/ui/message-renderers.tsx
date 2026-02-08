'use client';

import { useState, useEffect } from 'react';
import type {
  ChatMessage,
  PlaceCardMetadata,
  StyleSummaryMetadata,
  ReviewPreviewMetadata,
} from '@/entities/chat-message';
import { ChoiceButtons } from './ChoiceButtons';
import { PlaceCard } from './PlaceCard';
import { StyleSummaryCard } from './StyleSummaryCard';
import { ReviewPreview } from './ReviewPreview';

function useTypingEffect(text: string, enabled: boolean, speed: number = 15) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, enabled, speed]);

  return { displayedText, isTyping, fullText: text };
}

interface TextRendererProps {
  content: string;
  enableTyping?: boolean;
}

export function TextRenderer({ content, enableTyping = false }: TextRendererProps) {
  const { displayedText, isTyping, fullText } = useTypingEffect(content, enableTyping);

  if (!content) return null;

  return (
    <div className="relative">
      {/* Invisible full text to reserve space */}
      {enableTyping && (
        <p className="text-stone-800 leading-7 whitespace-pre-wrap text-[15px] invisible" aria-hidden>
          {fullText}
        </p>
      )}
      {/* Visible text */}
      <p className={enableTyping ? 'absolute inset-0 text-stone-800 leading-7 whitespace-pre-wrap text-[15px]' : 'text-stone-800 leading-7 whitespace-pre-wrap text-[15px]'}>
        {enableTyping ? displayedText : content}
        {isTyping && (
          <span className="inline-block w-0.5 h-5 bg-stone-400 ml-0.5 animate-pulse align-middle" />
        )}
      </p>
    </div>
  );
}

export function ChoiceRenderer({
  options,
  onSelect
}: {
  options: ChatMessage['options'];
  onSelect?: (id: string) => void;
}) {
  if (!options) return null;
  return <ChoiceButtons options={options} onSelect={onSelect} />;
}

export function PlaceCardRenderer({
  metadata,
  onConfirm
}: {
  metadata: unknown;
  onConfirm?: (confirmed: boolean) => void;
}) {
  return <PlaceCard metadata={metadata as PlaceCardMetadata} onConfirm={onConfirm} />;
}

export function StyleSummaryRenderer({ metadata }: { metadata: unknown }) {
  return <StyleSummaryCard metadata={metadata as StyleSummaryMetadata} />;
}

export function ReviewPreviewRenderer({
  metadata,
  onAction
}: {
  metadata: unknown;
  onAction?: (action: 'complete' | 'edit') => void;
}) {
  return <ReviewPreview metadata={metadata as ReviewPreviewMetadata} onAction={onAction} />;
}

export function LoadingRenderer() {
  return (
    <div className="flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2  bg-stone-300 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function SummaryRenderer({ metadata }: { metadata: Record<string, unknown> }) {
  if (!metadata) return null;

  return (
    <div className="bg-stone-50 rounded-xl p-4 space-y-2">
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} className="flex gap-2 text-sm">
          <span className="text-stone-400">{key}:</span>
          <span className="text-stone-600">{String(value)}</span>
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
    text: () => <TextRenderer content={message.content || ''} enableTyping={enableTyping} />,
    choice: () => (
      <>
        <TextRenderer content={message.content || ''} />
        <ChoiceRenderer options={message.options} onSelect={onChoiceSelect} />
      </>
    ),
    'place-card': () => <PlaceCardRenderer metadata={message.metadata} onConfirm={onPlaceConfirm} />,
    'style-summary': () => <StyleSummaryRenderer metadata={message.metadata} />,
    'review-preview': () => <ReviewPreviewRenderer metadata={message.metadata} onAction={onReviewAction} />,
    loading: () => <LoadingRenderer />,
    summary: () => (
      <>
        <TextRenderer content={message.content || ''} />
        <SummaryRenderer metadata={message.metadata as Record<string, unknown>} />
      </>
    ),
  };

  const render = renderers[message.type] || renderers.text;
  return <div className="space-y-3">{render()}</div>;
}
