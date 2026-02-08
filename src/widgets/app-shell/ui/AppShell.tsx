'use client';

import { type ReactNode } from 'react';
import { Sidebar } from '@/widgets/sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className='flex h-dvh overflow-hidden'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto min-w-0'>
        {children}
      </main>
    </div>
  );
}
