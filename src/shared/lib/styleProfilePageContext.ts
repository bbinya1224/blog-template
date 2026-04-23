import { readStyleProfile } from '@/shared/api/dataFiles';
import type { StyleProfile } from '@/shared/types/styleProfile';
import { getSession } from './authUtils';

interface AuthenticatedStyleProfileContext {
  userEmail: string;
  userName: string | null;
  styleProfile: StyleProfile | null;
}

export async function getAuthenticatedStyleProfileContext(): Promise<AuthenticatedStyleProfileContext | null> {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  const userEmail = session.user.email;
  const userName = session.user.name || null;
  const styleProfile = await readStyleProfile(userEmail);

  return {
    userEmail,
    userName,
    styleProfile,
  };
}
