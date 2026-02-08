import axios from 'axios';
import { withRetry } from '@/shared/lib/retry';
import { USER_AGENTS, RSS_TIMEOUT_MS, RSS_RETRY_OPTIONS } from './constants';
import {
  enforceHttps,
  downgradeToHttp,
  isProtocolError,
} from './url-utils';

export const getRandomUserAgent = (): string =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

export const withProtocolFallback = async <T>(
  originalUrl: string,
  fetchFn: (url: string) => Promise<T>,
): Promise<T> => {
  const httpsUrl = enforceHttps(originalUrl);

  try {
    return await fetchFn(httpsUrl);
  } catch (httpsError) {
    if (!isProtocolError(httpsError)) {
      throw httpsError;
    }

    const httpUrl = downgradeToHttp(originalUrl);

    if (httpUrl === httpsUrl) {
      throw httpsError;
    }

    try {
      console.warn(`⚠️  HTTPS 실패 (SSL 에러), HTTP로 재시도: ${httpUrl}`);
      return await fetchFn(httpUrl);
    } catch (httpError) {
      throw new ProtocolFallbackError(
        httpsError instanceof Error ? httpsError : new Error(String(httpsError)),
        httpError instanceof Error ? httpError : new Error(String(httpError)),
      );
    }
  }
};

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
