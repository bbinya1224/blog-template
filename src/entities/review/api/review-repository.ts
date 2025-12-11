import fs from 'fs';
import path from 'path';
import { Review } from '../model/review';

const REVIEWS_DIR = path.join(process.cwd(), 'data/reviews');

export async function getReviews(): Promise<Review[]> {
  if (!fs.existsSync(REVIEWS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(REVIEWS_DIR).filter((file) => file.endsWith('.md'));

  const reviews = files.map((file) => {
    const filePath = path.join(REVIEWS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const id = file.replace('.md', '');
    
    // Filename format: StoreName_YYYY-MM-DD.md
    // We need to handle cases where StoreName might contain underscores, 
    // but usually the date is at the end.
    // Let's split by '_' and take the last part as date, rest as store name.
    const parts = id.split('_');
    const date = parts.pop() || '';
    const storeName = parts.join('_');

    return {
      id,
      storeName,
      date,
      content,
      preview: content.slice(0, 150) + '...',
    };
  });

  // Sort by date descending
  return reviews.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getReviewById(id: string): Promise<Review | null> {
  const filePath = path.join(REVIEWS_DIR, `${id}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  const parts = id.split('_');
  const date = parts.pop() || '';
  const storeName = parts.join('_');

  return {
    id,
    storeName,
    date,
    content,
    preview: content.slice(0, 150) + '...',
  };
}
