'use client';

import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { cn } from '@/shared/lib/utils';
import { resetConversationAtom } from '@/features/chat-review/model/atoms';
import { useSidebar } from '../model/sidebar-context';
import { SidebarReviewList } from './SidebarReviewList';
import { SidebarUserProfile } from './SidebarUserProfile';

function getIsDesktop() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 768px)').matches;
}

function OrotiIcon() {
  return (
    <svg viewBox='0 0 32 32' fill='none' className='size-8 shrink-0'>
      <circle cx='16' cy='16' r='14' fill='#E8825C' />
      <circle cx='16' cy='16' r='9' fill='#FFFBF7' />
      <circle cx='16' cy='16' r='5' fill='#F4A261' />
    </svg>
  );
}

export function Sidebar() {
  const { isExpanded, showLabels, toggle, collapse } = useSidebar();
  const router = useRouter();
  const resetConversation = useSetAtom(resetConversationAtom);

  const handleNewRecord = () => {
    router.push('/');
    resetConversation();
    if (!getIsDesktop()) collapse();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isExpanded && (
        <div
          role='button'
          aria-label='사이드바 닫기'
          tabIndex={0}
          className='fixed inset-0 z-40 bg-black/30 md:hidden'
          onClick={collapse}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') collapse();
          }}
        />
      )}

      <aside
        className={cn(
          'z-50 flex h-full flex-col overflow-hidden border-r border-stone-200 bg-white',
          'shrink-0 transition-[width] duration-300 ease-in-out',
          isExpanded ? 'w-64' : 'w-16',
          // Mobile: fixed overlay when expanded
          isExpanded ? 'fixed top-0 left-0 md:relative' : 'relative',
        )}
      >
        {/* Top: Brand + Toggle */}
        <div className='flex h-14 shrink-0 items-center border-b border-stone-100'>
          <button
            onClick={toggle}
            aria-label={isExpanded ? '사이드바 접기' : '사이드바 펼치기'}
            aria-expanded={isExpanded}
            className='flex w-16 shrink-0 justify-center transition-opacity hover:opacity-80'
          >
            <OrotiIcon />
          </button>
          {showLabels && (
            <>
              <span className='text-base font-bold tracking-tight whitespace-nowrap text-stone-800'>
                오롯이
              </span>
              <div className='flex-1' />
              <button
                onClick={toggle}
                className='mr-3 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100'
              >
                <svg
                  className='size-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* New Record Button */}
        <div className='shrink-0 border-b border-stone-100'>
          <button
            onClick={handleNewRecord}
            className='flex w-full items-center py-2.5 transition-colors hover:bg-stone-100'
            title='새 기록 남기기'
          >
            <div className='flex w-16 shrink-0 justify-center'>
              <svg
                className='size-5 text-(--primary)'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
            </div>
            {showLabels && (
              <span className='text-sm font-medium whitespace-nowrap text-stone-700'>
                새 기록 남기기
              </span>
            )}
          </button>
        </div>

        {/* Review List (scrollable) */}
        <div className='sidebar-scrollbar min-h-0 flex-1 overflow-y-auto'>
          {showLabels && (
            <div className='px-4 pt-3 pb-1'>
              <p className='text-xs font-semibold tracking-wider text-stone-400 uppercase'>
                보관함
              </p>
            </div>
          )}
          <SidebarReviewList />
        </div>

        {/* Bottom: User Profile */}
        <div className='shrink-0 border-t border-stone-100'>
          <SidebarUserProfile />
        </div>
      </aside>
    </>
  );
}
