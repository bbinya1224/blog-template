'use client';

import { useSession, signOut } from 'next-auth/react';
import { useSidebar } from '../model/sidebarContext';

export function SidebarUserProfile() {
  const { data: session, status } = useSession();
  const { showLabels, expand } = useSidebar();

  if (status === 'loading') {
    return (
      <div className="p-3 ">
        <div className="size-8  rounded-full bg-stone-200 animate-pulse" />
      </div>
    );
  }

  if (!session?.user) return null;

  const avatar = session.user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={session.user.image}
      alt={session.user.name || 'User'}
      className="size-8  rounded-full border border-stone-200 shrink-0"
    />
  ) : (
    <div className="size-8  rounded-full bg-(--primary) flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-white">
        {(session.user.name || 'U')[0]}
      </span>
    </div>
  );

  if (!showLabels) {
    return (
      <button onClick={expand} className="w-full py-3 hover:bg-stone-50 transition-colors">
        <div className="w-16 flex justify-center">
          {avatar}
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {avatar}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 truncate">
          {session.user.name}
        </p>
      </div>
      <button
        onClick={() => signOut()}
        className="text-xs text-stone-400 hover:text-stone-600 transition-colors shrink-0"
      >
        로그아웃
      </button>
    </div>
  );
}
