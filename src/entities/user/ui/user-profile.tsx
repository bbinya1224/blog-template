'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Google로 로그인
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user?.image && (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="h-8 w-8 rounded-full border border-gray-200"
        />
      )}
      <span className="hidden text-sm font-medium text-gray-700 md:inline-block">
        {session.user?.name}
      </span>
      <button
        onClick={() => signOut()}
        className="text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        로그아웃
      </button>
    </div>
  );
}
