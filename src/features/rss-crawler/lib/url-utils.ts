/**
 * URL 파싱 및 변환 유틸리티
 */

/**
 * 네이버 블로그 원본 URL에서 blogId, logNo 추출
 * - https://blog.naver.com/bbinjjam/224688244...
 * - https://m.blog.naver.com/bbinjjam/224688244...
 */
export const parseNaverBlogUrl = (
  url: string,
): { blogId?: string; logNo?: string } => {
  try {
    const u = new URL(url);

    // Check query params first for blogId
    const queryBlogId = u.searchParams.get('blogId');
    const [pathBlogId, pathLogNo] = u.pathname.split('/').filter(Boolean);
    const searchLogNo = u.searchParams.get('logNo');

    return {
      blogId: queryBlogId || pathBlogId,
      logNo: pathLogNo || searchLogNo || undefined,
    };
  } catch {
    return {};
  }
};

/**
 * viewer / mobile URL 생성
 */
export const buildViewerAndMobileUrls = (originalUrl: string): string[] => {
  const { blogId, logNo } = parseNaverBlogUrl(originalUrl);
  const urls: string[] = [];

  if (blogId && logNo) {
    urls.push(
      `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`,
    );
    urls.push(`https://m.blog.naver.com/${blogId}/${logNo}`);
  }

  urls.push(originalUrl);

  return urls;
};

/**
 * HTTP를 HTTPS로 강제 변환
 */
export const enforceHttps = (url: string): string => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};
