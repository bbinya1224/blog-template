import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import { crawlBlogRss } from '@/lib/rss-crawler';

export async function POST(req: NextRequest) {
  try {
    const { rssUrl, maxPosts = 20, debug = false } = await req.json();

    if (!rssUrl) {
      return NextResponse.json(
        { error: 'rssUrl이 필요합니다.' },
        { status: 400 }
      );
    }

    const mergedText = await crawlBlogRss(rssUrl, maxPosts, { debug });

    const dataDir = path.join(process.cwd(), 'data', 'rss-content');
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, 'blog-posts.txt');
    await fs.writeFile(filePath, mergedText, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'RSS 크롤링 및 텍스트 저장 완료',
      savedPath: filePath,
      length: mergedText.length,
    });
  } catch (error: unknown) {
    console.error('fetch-rss error:', error);

    const message =
      error instanceof Error ? error.message : 'RSS 크롤링 실패';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
