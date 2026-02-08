export const parseNaverBlogUrl = (
  url: string,
): { blogId?: string; logNo?: string } => {
  try {
    const u = new URL(url);

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

export const enforceHttps = (url: string): string => {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export const downgradeToHttp = (url: string): string => {
  if (url.startsWith('https://')) {
    return url.replace('https://', 'http://');
  }
  return url;
};

export const isProtocolError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;

  const err = error as Record<string, unknown>;
  const code = String(err.code || '');
  const message = String(err.message || '');

  const protocolErrorCodes = [
    'ERR_SSL_PROTOCOL_ERROR',
    'EPROTO',
    'CERT_HAS_EXPIRED',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'ERR_TLS_CERT_ALTNAME_INVALID',
  ];

  const isProtocolCode = protocolErrorCodes.some((errorCode) =>
    code.includes(errorCode)
  );

  const hasProtocolMessage =
    message.includes('SSL') ||
    message.includes('certificate') ||
    message.includes('TLS') ||
    message.includes('HTTPS');

  return isProtocolCode || hasProtocolMessage;
};
