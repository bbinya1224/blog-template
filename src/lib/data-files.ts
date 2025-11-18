import fs from 'fs/promises';
import path from 'path';
import type { ReviewPayload, StyleProfile } from './types';
import { sanitizeFileName } from './utils';

const DATA_ROOT = path.join(process.cwd(), 'data');
const RSS_DIR = path.join(DATA_ROOT, 'rss-content');
const REVIEWS_DIR = path.join(DATA_ROOT, 'reviews');
const STYLES_DIR = path.join(DATA_ROOT, 'styles');

export const BLOG_POSTS_PATH = path.join(RSS_DIR, 'blog-posts.txt');
export const STYLE_PROFILE_PATH = path.join(STYLES_DIR, 'my-style.json');

/**
 * 데이터 폴더 구조 생성
 */
export const ensureDataStructure = async (): Promise<void> => {
  await Promise.all([
    fs.mkdir(RSS_DIR, { recursive: true }),
    fs.mkdir(REVIEWS_DIR, { recursive: true }),
    fs.mkdir(STYLES_DIR, { recursive: true }),
  ]);
};

/**
 * 저장된 블로그 글 읽기
 */
export const readBlogPosts = async (): Promise<string> => {
  await ensureDataStructure();
  try {
    return await fs.readFile(BLOG_POSTS_PATH, 'utf-8');
  } catch {
    return '';
  }
};

/**
 * 블로그 글 저장
 */
export const saveBlogPosts = async (content: string): Promise<void> => {
  await ensureDataStructure();
  await fs.writeFile(BLOG_POSTS_PATH, content, 'utf-8');
};

/**
 * 스타일 프로필 읽기
 */
export const readStyleProfile = async (): Promise<StyleProfile | null> => {
  await ensureDataStructure();
  try {
    const raw = await fs.readFile(STYLE_PROFILE_PATH, 'utf-8');
    return JSON.parse(raw) as StyleProfile;
  } catch {
    return null;
  }
};

/**
 * 스타일 프로필 저장
 */
export const saveStyleProfile = async (
  profile: StyleProfile
): Promise<void> => {
  await ensureDataStructure();
  await fs.writeFile(
    STYLE_PROFILE_PATH,
    JSON.stringify(profile, null, 2),
    'utf-8'
  );
};

/**
 * 리뷰를 마크다운 파일로 저장
 */
export const saveReviewToFile = async (
  review: string,
  payload: ReviewPayload
): Promise<string> => {
  await ensureDataStructure();

  const safeName = sanitizeFileName(payload.name) || 'review';
  const safeDate = payload.date || 'today';
  const fileName = `${safeName}_${safeDate}.md`;
  const filePath = path.join(REVIEWS_DIR, fileName);

  const body = `# ${payload.name}\n\n${payload.date} 방문\n\n${review}\n`;
  await fs.writeFile(filePath, body, 'utf-8');

  return filePath;
};
