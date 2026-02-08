import type { StyleProfile } from '@/shared/types/style-profile';
import { API_ENDPOINTS, STATUS_MESSAGES } from '@/shared/config/constants';

export const analyzeStyle = async (
  rssUrl: string,
  maxPosts: number,
): Promise<StyleProfile> => {
  // 1. RSS Fetch
  const fetchResponse = await fetch(API_ENDPOINTS.FETCH_RSS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rssUrl, maxPosts }),
  });

  if (!fetchResponse.ok) {
    const errorData = await fetchResponse.json().catch(() => ({}));
    throw new Error(errorData.error || 'RSS를 읽어오지 못했습니다.');
  }

  // 2. Style Analysis
  const analysisResponse = await fetch(API_ENDPOINTS.ANALYZE_STYLE, {
    method: 'POST',
  });

  if (!analysisResponse.ok) {
    const errorData = await analysisResponse.json().catch(() => ({}));
    throw new Error(errorData.error || STATUS_MESSAGES.ANALYSIS_ERROR);
  }

  const data = (await analysisResponse.json()) as {
    styleProfile: StyleProfile;
  };

  return data.styleProfile;
};

export const saveStyleProfileToStorage = (profile: StyleProfile): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('styleProfile', JSON.stringify(profile));
  localStorage.setItem('styleProfileDate', new Date().toISOString());
};
