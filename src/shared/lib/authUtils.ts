import { cache } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';

export const getSession = cache(async () => {
  return await getServerSession(authOptions);
});

export type AuthenticatedSession = {
  user: { email: string; name: string | null };
};

export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect('/');
  }

  return {
    user: {
      email: session.user.email,
      name: session.user.name ?? null,
    },
  };
}
