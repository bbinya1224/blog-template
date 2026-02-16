'use client';

import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { cn } from '@/shared/lib/utils';
import { OrotiLogo } from '@/shared/ui/Icons';
import { resetConversationAtom } from '@/features/chat-review';
import { useSidebar } from '../model/sidebar-context';
import { SidebarReviewList } from './SidebarReviewList';
import { SidebarUserProfile } from './SidebarUserProfile';

export function Sidebar() {
  const { isExpanded, isDesktop, showLabels, toggle, collapse } = useSidebar();
  const router = useRouter();
  const resetConversation = useSetAtom(resetConversationAtom);

  const handleNewRecord = () => {
    router.push('/');
    resetConversation();
    if (!isDesktop) collapse();
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
            <OrotiLogo className='size-8 shrink-0' />
          </button>
          {showLabels && (
            <>
              <button
                type='button'
                onClick={handleNewRecord}
                aria-label='처음 화면으로 돌아가기'
                className='text-base font-bold tracking-tight whitespace-nowrap text-stone-800 transition-opacity hover:opacity-70'
              >
                오롯이
              </button>
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
        <div
          className={cn(
            'sidebar-scrollbar min-h-0 flex-1',
            isExpanded ? 'overflow-y-auto' : 'overflow-hidden',
          )}
        >
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
