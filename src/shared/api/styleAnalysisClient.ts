import type { StyleProfile } from '@/shared/types/styleProfile';
import { API_ENDPOINTS } from '@/shared/config/constants';
import { apiPost } from './httpClient';

export const analyzeStyle = async (
  rssUrl: string,
  maxPosts: number,
): Promise<StyleProfile> => {
  await apiPost(API_ENDPOINTS.FETCH_RSS, { rssUrl, maxPosts });

  const data = await apiPost<{ styleProfile: StyleProfile }>(API_ENDPOINTS.ANALYZE_STYLE);

  return data.styleProfile;
};

export const saveStyleProfileToStorage = (profile: StyleProfile): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('styleProfile', JSON.stringify(profile));
  localStorage.setItem('styleProfileDate', new Date().toISOString());
};
