'use client';

import { ReactNode } from 'react';
import { SessionProvider } from '@/shared/providers/SessionProvider';
import { TRPCProvider } from '@/shared/api/trpc';
import { OverlayProvider } from '@/shared/providers/overlay';
import { SidebarProvider } from '@/widgets/sidebar';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * App-level provider composition.
 * Combines all global providers for this application.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <OverlayProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </OverlayProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
