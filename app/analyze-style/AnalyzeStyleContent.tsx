'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useChatStore,
  useChatHandlers,
  MESSAGES,
  CHOICE_OPTIONS,
  type StyleSetupContext,
} from '@/features/chat-review';
import { MessageList } from '@/widgets/chat';
import { InputArea } from '@/shared/ui/InputArea';
import type { StyleProfile } from '@/entities/style-profile';
import { cn } from '@/shared/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface AnalyzeStyleContentProps {
  userEmail: string;
  userName: string | null;
  existingStyleProfile: StyleProfile | null;
}

function formatStyleForDisplay(profile: StyleProfile): Record<string, unknown> {
  return {
    writingStyle: profile.writing_style?.tone || '친근한 톤',
    emojiUsage: profile.writing_style?.emoji_usage || '적당히 사용',
    sentenceLength: profile.visual_structure?.paragraph_pattern || '보통',
    tone: profile.writing_style?.formality || '존댓말',
    frequentExpressions:
      profile.keyword_profile?.frequent_words?.slice(0, 5) || [],
  };
}

export function AnalyzeStyleContent({
  userEmail,
  userName,
  existingStyleProfile,
}: AnalyzeStyleContentProps) {
  const router = useRouter();
  const step = useChatStore((s) => s.step);
  const storeUserName = useChatStore((s) => s.userName);
  const setStep = useChatStore((s) => s.setStep);
  const setMessages = useChatStore((s) => s.setMessages);
  const setStyleProfile = useChatStore((s) => s.setStyleProfile);
  const setHasExistingStyle = useChatStore((s) => s.setHasExistingStyle);
  const [styleSetupContext, setStyleSetupContext] = useState<StyleSetupContext>(
    {},
  );
  const [isInputEnabled, setIsInputEnabled] = useState(!existingStyleProfile);
  const isInitializedRef = useRef(false);
  const redirectTimerRef = useRef<NodeJS.Timeout>(undefined);

  const messages = useChatStore((s) => s.messages);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const {
    handleSendMessage,
    handleChoiceSelect: originalHandleChoiceSelect,
    isProcessing,
  } = useChatHandlers({ userEmail, styleSetupContext, setStyleSetupContext });

  // Cleanup redirect timer on unmount
  useEffect(() => () => clearTimeout(redirectTimerRef.current), []);

  // Initialize on mount (ref guard prevents re-execution)
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    setMessages([]);

    if (existingStyleProfile) {
      setStyleProfile(existingStyleProfile);
      setHasExistingStyle(true);
      setStep('style-check');

      addAssistantMessage(
        MESSAGES.styleCheck.hasStyle(userName || storeUserName || ''),
        'style-summary',
        CHOICE_OPTIONS.styleAnalyzeAction,
        formatStyleForDisplay(existingStyleProfile),
      );
    } else {
      setStep('style-setup');
      addAssistantMessage(
        MESSAGES.styleAnalyze.welcome,
        'choice',
        CHOICE_OPTIONS.styleSetupMethod,
      );
    }
  }, [existingStyleProfile, userName, storeUserName, setMessages, setStyleProfile, setHasExistingStyle, setStep, addAssistantMessage]);

  // Handle step changes (for style-setup → style-check → topic-select flow)
  useEffect(() => {
    if (!isInitializedRef.current) return;

    switch (step) {
      case 'topic-select':
        addAssistantMessage(
          MESSAGES.styleAnalyze.complete(userName || storeUserName || ''),
          'text',
        );
        redirectTimerRef.current = setTimeout(() => router.push('/'), 2000);
        break;
    }
  }, [step, addAssistantMessage, userName, storeUserName, router]);

  // Custom choice handler - intercepts page-specific actions
  const handleChoiceSelect = useCallback(
    (messageId: string, optionId: string) => {
      if (optionId === 'go-home') {
        router.push('/');
        return;
      }

      if (optionId === 'modify') {
        setIsInputEnabled(true);
        addAssistantMessage(MESSAGES.styleCheck.styleModifyRequest, 'text');
        return;
      }

      // Delegate everything else to the default handler
      originalHandleChoiceSelect(messageId, optionId);
    },
    [router, addAssistantMessage, originalHandleChoiceSelect],
  );

  const inputPlaceholder =
    step === 'style-setup'
      ? '블로그 URL 또는 내용을 입력해주세요'
      : '수정하고 싶은 내용을 입력해주세요';

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='flex shrink-0 items-center gap-3 px-6 py-3'>
        <button
          onClick={() => router.push('/')}
          className='rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600'
        >
          <ArrowLeft className='size-5' />
        </button>
        <h2 className='text-sm font-semibold text-stone-700'>글 스타일 분석</h2>
      </div>

      {/* Chat area */}
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col',
          'md:mx-auto md:max-w-3xl',
        )}
      >
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <MessageList
            messages={messages}
            isTyping={isProcessing}
            onChoiceSelect={handleChoiceSelect}
          />
        </div>

        <InputArea
          onSend={handleSendMessage}
          disabled={!isInputEnabled || isProcessing}
          placeholder={inputPlaceholder}
        />
      </div>
    </div>
  );
}
