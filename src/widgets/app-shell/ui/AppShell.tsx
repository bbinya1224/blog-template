'use client';

import { type ReactNode } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { useChatStore } from '@/features/chat-review';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className='flex h-dvh flex-col overflow-hidden md:flex-row'>
      <Sidebar onNewRecord={() => useChatStore.getState().reset()} />
      <main className='min-h-0 flex-1 overflow-y-auto min-w-0'>
        {children}
      </main>
    </div>
  );
}
