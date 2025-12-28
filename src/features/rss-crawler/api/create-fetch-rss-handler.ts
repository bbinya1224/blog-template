import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth';

type FetchRssPayload = {
  rssUrl: string;
  maxPosts?: number;
  debug?: boolean;
};

type CrawlResult = {
  mergedText: string;
  samples: string[];
};

type FetchRssDeps = {
  crawlBlogRss: (
    rssUrl: string,
    maxPosts: number,
    options?: { debug?: boolean }
  ) => Promise<CrawlResult>;

  saveBlogPosts: (email: string, content: string) => Promise<void>;
  saveBlogSamples: (email: string, samples: string[]) => Promise<void>;
};

const isValidFetchRssPayload = (body: unknown): body is FetchRssPayload => {
  if (!body || typeof body !== 'object') return false;

  const payload = body as Record<string, unknown>;

  if (typeof payload.rssUrl !== 'string' || !payload.rssUrl.trim()) {
    return false;
  }

  if (payload.maxPosts !== undefined && typeof payload.maxPosts !== 'number') {
    return false;
  }

  if (payload.debug !== undefined && typeof payload.debug !== 'boolean') {
    return false;
  }

  return true;
};

export const createFetchRssHandler = ({
  crawlBlogRss,
  saveBlogPosts,
  saveBlogSamples,
}: FetchRssDeps) => {
  return async (req: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }
      const email = session.user.email;

      const body: unknown = await req.json();

      if (!isValidFetchRssPayload(body)) {
        return NextResponse.json(
          { error: 'rssUrl이 필요합니다.' },
          { status: 400 }
        );
      }

      const { rssUrl, maxPosts = 20, debug = false } = body;

      const { mergedText, samples } = await crawlBlogRss(rssUrl, maxPosts, {
        debug,
      });

      await Promise.all([
          saveBlogPosts(email, mergedText), 
          saveBlogSamples(email, samples)
      ]);

      return NextResponse.json({
        success: true,
        message: 'RSS 크롤링, 스타일 분석 데이터 및 샘플 저장 완료 (DB)',
        sampleCount: samples.length,
        length: mergedText.length,
      });
    } catch (error) {
      console.error('fetch-rss error:', error);

      const message =
        error instanceof Error ? error.message : 'RSS 크롤링 실패';

      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
};
