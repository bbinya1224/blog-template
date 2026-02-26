'use client';

import { ReactNode } from 'react';
import { SessionProvider } from '@/shared/providers/SessionProvider';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { OverlayProvider } from '@/shared/providers/overlay';
import { SidebarProvider } from '@/widgets/sidebar';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <OverlayProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </OverlayProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
