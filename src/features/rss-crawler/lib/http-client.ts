/**
 * HTTP 요청 관련 유틸리티
 */

import axios from 'axios';
import { withRetry } from '@/shared/lib/retry';
import { USER_AGENTS, RSS_TIMEOUT_MS, RSS_RETRY_OPTIONS } from './constants';
import {
  enforceHttps,
  downgradeToHttp,
  isProtocolError,
} from './url-utils';

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
 * 프로토콜 Fallback 에러 클래스
 * - HTTPS, HTTP 둘 다 실패 시 상세 정보 제공
 */
export class ProtocolFallbackError extends Error {
  constructor(
    public readonly httpsError: Error,
    public readonly httpError: Error,
  ) {
    super(
      `모든 프로토콜 시도 실패:\n` +
        `  - HTTPS: ${httpsError.message}\n` +
        `  - HTTP: ${httpError.message}`,
    );
    this.name = 'ProtocolFallbackError';
  }
}

/**
 * HTTPS 우선 시도 → 프로토콜 에러 시 HTTP로 fallback
 *
 * @description
 * - HTTPS URL을 먼저 시도
 * - SSL/TLS 에러 발생 시만 HTTP로 재시도
 * - 일반 네트워크 에러(404, timeout 등)는 즉시 throw
 * - 두 시도 모두 실패 시 통합 에러 반환
 *
 * @example
 * const html = await withProtocolFallback(
 *   'http://example.com',
 *   (url) => axios.get(url).then(r => r.data)
 * );
 */
export const withProtocolFallback = async <T>(
  originalUrl: string,
  fetchFn: (url: string) => Promise<T>,
): Promise<T> => {
  const httpsUrl = enforceHttps(originalUrl);

  try {
    // 1차 시도: HTTPS
    return await fetchFn(httpsUrl);
  } catch (httpsError) {
    // SSL/프로토콜 에러가 아니면 즉시 throw
    if (!isProtocolError(httpsError)) {
      throw httpsError;
    }

    const httpUrl = downgradeToHttp(originalUrl);

    // 원본 URL이 이미 HTTPS였다면 downgrade 불가
    if (httpUrl === httpsUrl) {
      throw httpsError;
    }

    // 2차 시도: HTTP fallback
    try {
      console.warn(`⚠️  HTTPS 실패 (SSL 에러), HTTP로 재시도: ${httpUrl}`);
      return await fetchFn(httpUrl);
    } catch (httpError) {
      // 둘 다 실패 → 통합 에러
      throw new ProtocolFallbackError(
        httpsError instanceof Error ? httpsError : new Error(String(httpsError)),
        httpError instanceof Error ? httpError : new Error(String(httpError)),
      );
    }
  }
};

/**
 * HTML 페이지 가져오기 (재시도 + HTTPS→HTTP fallback)
 *
 * @description
 * - HTTPS 우선 시도, SSL 에러 시 HTTP로 자동 fallback
 * - 네트워크 에러 발생 시 자동 재시도 (withRetry)
 */
export const fetchHtml = async (
  url: string,
  referer?: string,
): Promise<string> => {
  return withProtocolFallback(url, (resolvedUrl) =>
    withRetry(
      () =>
        axios
          .get<string>(resolvedUrl, {
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
    ),
  );
};
