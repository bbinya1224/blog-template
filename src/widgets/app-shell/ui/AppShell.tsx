'use client';

import { type ReactNode } from 'react';
import { Sidebar } from '@/widgets/sidebar';
import { useSidebar } from '@/widgets/sidebar/model/sidebarContext';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isExpanded, collapse } = useSidebar();

  return (
    <div className='flex h-dvh overflow-hidden'>
      <Sidebar />
      <main
        className='min-h-0 flex-1 overflow-y-auto min-w-0'
        onClick={() => isExpanded && collapse()}
      >
        {children}
      </main>
    </div>
  );
}
