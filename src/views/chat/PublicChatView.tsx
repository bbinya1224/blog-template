'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { ChatContainer } from '@/widgets/chat';
import { Modal } from '@/shared/ui/Modal';
import { MESSAGES } from '@/features/chat-review';
import { LogIn } from 'lucide-react';
import type { ChatMessage } from '@/entities/chat-message';

const LOGIN_PROMPT_MESSAGES: ChatMessage[] = [
  {
    id: 'login-prompt-text',
    role: 'assistant',
    type: 'text',
    content:
      '반가워요! 오롯이와 함께 경험을 기록하려면 로그인이 필요해요.\n간편하게 로그인해주세요!',
    timestamp: new Date(),
  },
  {
    id: 'login-prompt-choice',
    role: 'assistant',
    type: 'choice',
    content: '',
    options: [{ id: 'login', label: 'Google로 로그인하기', icon: '🔐' }],
    timestamp: new Date(),
  },
];

export function PublicChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const showLoginPrompt = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      ...LOGIN_PROMPT_MESSAGES.map((msg) => ({
        ...msg,
        id: `${msg.id}-${Date.now()}`,
        timestamp: new Date(),
      })),
    ]);
    setIsInputDisabled(true);
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        type: 'text',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      showLoginPrompt();
    },
    [showLoginPrompt],
  );

  const handleCategorySelect = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const handleChoiceSelect = useCallback(
    (_messageId: string, optionId: string) => {
      if (optionId === 'login') {
        signIn('google', { callbackUrl: '/' });
      }
    },
    [],
  );

  const handleLoginClick = useCallback(() => {
    signIn('google', { callbackUrl: '/' });
  }, []);

  return (
    <>
      <ChatContainer
        messages={messages}
        currentStep='topic-select'
        isAuthenticated={false}
        isInputDisabled={isInputDisabled}
        inputPlaceholder='기록하고 싶은 경험을 알려주세요...'
        onSendMessage={handleSendMessage}
        onChoiceSelect={handleChoiceSelect}
        onCategorySelect={handleCategorySelect}
        onLoginClick={handleLoginClick}
      />

      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={MESSAGES.welcome.loginModalTitle}
        size='sm'
      >
        <div className='flex flex-col items-center gap-5 py-2 text-center'>
          <p className='text-sm/relaxed whitespace-pre-line text-stone-600'>
            {MESSAGES.welcome.loginModalMessage}
          </p>
          <button
            onClick={handleLoginClick}
            className='inline-flex items-center gap-2 rounded-xl bg-stone-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700'
          >
            <LogIn className='size-4' />
            {MESSAGES.welcome.loginModalButton}
          </button>
        </div>
      </Modal>
    </>
  );
}
