/**
 * HTTP 요청 관련 유틸리티
 */

import axios from 'axios';
import { withRetry } from '@/shared/lib/retry';
import { USER_AGENTS, RSS_TIMEOUT_MS, RSS_RETRY_OPTIONS } from './constants';

/**
 * 랜덤 User-Agent 선택
 */
export const getRandomUserAgent = (): string =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

/**
 * 지연 실행 헬퍼
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * HTML 페이지 가져오기 (재시도 로직 포함)
 */
export const fetchHtml = async (
  url: string,
  referer?: string,
): Promise<string> => {
  return withRetry(
    () =>
      axios
        .get<string>(url, {
          timeout: RSS_TIMEOUT_MS,
          headers: {
            'User-Agent': getRandomUserAgent(),
            Referer: referer || 'https://blog.naver.com',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Upgrade-Insecure-Requests': '1',
          },
        })
        .then((res) => res.data),
    RSS_RETRY_OPTIONS,
  );
};
