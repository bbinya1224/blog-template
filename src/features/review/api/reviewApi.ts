import type { StyleProfile } from '@/shared/types/styleProfile';
import { apiGet } from '@/shared/api/httpClient';

export const loadStyleProfile = async (): Promise<StyleProfile | null> => {
  if (typeof window !== 'undefined') {
    const savedProfile = localStorage.getItem('styleProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile) as StyleProfile;
    }
  }

  try {
    const data = await apiGet<{ styleProfile: StyleProfile }>('/api/style-profile');
    return data.styleProfile;
  } catch {
    return null;
  }
};

export const copyToClipboard = async (text: string): Promise<void> => {
  if (!text || typeof navigator === 'undefined') return;
  await navigator.clipboard.writeText(text);
};
