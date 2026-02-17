'use client';

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useChatStore } from '../model/store';

interface ChatErrorBoundaryProps {
  children: ReactNode;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChatErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ChatErrorBoundary]', error, errorInfo);
  }

  handleReset = (): void => {
    useChatStore.getState().reset();
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen items-center justify-center bg-stone-50 p-4'>
          <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg'>
            <h2 className='mb-3 text-2xl font-bold text-stone-900'>
              문제가 생겼어요
            </h2>
            <p className='mb-6 whitespace-pre-line text-stone-600'>
              채팅 중 오류가 발생했어요. <br />새 대화를 시작해주세요.
            </p>
            <button
              onClick={this.handleReset}
              className='w-full rounded-xl bg-stone-900 px-6 py-3 font-medium text-white transition-colors hover:bg-stone-800'
            >
              새 대화 시작
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
