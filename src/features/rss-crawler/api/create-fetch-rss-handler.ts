import { NextRequest, NextResponse } from 'next/server';

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

  saveBlogPosts: (content: string) => Promise<void>;
  saveBlogSamples: (samples: string[]) => Promise<void>;

  blogPostsPath: string;
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
  blogPostsPath,
}: FetchRssDeps) => {
  return async (req: NextRequest) => {
    try {
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

      await Promise.all([saveBlogPosts(mergedText), saveBlogSamples(samples)]);

      return NextResponse.json({
        success: true,
        message: 'RSS 크롤링, 스타일 분석 데이터 및 샘플 저장 완료',
        savedPath: blogPostsPath,
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
