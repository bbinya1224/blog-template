import { supabaseAdmin } from '@/shared/lib/supabase';
import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';

/**
 * 저장된 블로그 글 읽기 (RSS_CONTENTS 테이블)
 */
export const readBlogPosts = async (email: string): Promise<string> => {
  if (!email) return '';

  const { data, error } = await supabaseAdmin
    .from('rss_contents')
    .select('content')
    .eq('user_email', email)
    .order('created_at', { ascending: false })
    .limit(10); // 최근 10개만 가져옴

  if (error || !data) {
    return '';
  }

  return data.map((item) => item.content).join('\n\n---\n\n');
};

/**
 * 블로그 글 저장
 */
export const saveBlogPosts = async (email: string, content: string): Promise<void> => {
  if (!email) return;

  // 통으로 저장하는 경우는 보통 없지만 호환성을 위해 유지
  // "Bulk Import" 느낌으로 저장
  await supabaseAdmin.from('rss_contents').insert({
    user_email: email,
    content: content,
    title: 'Bulk Text Import',
    created_at: new Date().toISOString(),
  });
};

/**
 * 스타일 프로필 읽기
 */
export const readStyleProfile = async (email: string): Promise<StyleProfile | null> => {
  if (!email) return null;

  const { data, error } = await supabaseAdmin
    .from('user_styles')
    .select('style_data')
    .eq('user_email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data.style_data as StyleProfile;
};

/**
 * 스타일 프로필 저장
 */
export const saveStyleProfile = async (
  email: string,
  profile: StyleProfile
): Promise<void> => {
  if (!email) return;

  const { data: existing } = await supabaseAdmin
    .from('user_styles')
    .select('id')
    .eq('user_email', email)
    .single();

  if (existing) {
    await supabaseAdmin
      .from('user_styles')
      .update({
        style_data: profile,
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', email);
  } else {
    await supabaseAdmin.from('user_styles').insert({
      user_email: email,
      style_data: profile,
    });
  }
};

/**
 * 리뷰를 DB에 저장
 * 반환값: Review ID
 */
export const saveReviewToDB = async (
  email: string,
  review: string,
  payload: ReviewPayload
): Promise<string> => {
  if (!email) throw new Error('User email is required');

  const { data, error } = await supabaseAdmin
    .from('user_reviews')
    .insert({
      user_email: email,
      restaurant_name: payload.name,
      visit_date: payload.date || new Date().toISOString(),
      review_content: review,
      metadata: payload,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save review: ${error.message}`);
  }

  return data.id;
};

// 하위 호환성을 위해 남겨둠 (하지만 쓰지 않는 것을 권장)
export const saveReviewToFile = async (
    review: string,
    payload: ReviewPayload
  ): Promise<string> => {
    throw new Error('saveReviewToFile is deprecated. Use saveReviewToDB instead.');
};


// 샘플 배열을 DB에 저장
export const saveBlogSamples = async (email: string, samples: string[]) => {
  if (!email || samples.length === 0) return;

  const rows = samples.map((sample) => {
     let title = 'Sample';
     let content = sample;
     if (sample.length > 200) {
         // Try to extract title from first line
         const firstLine = sample.split('\n')[0];
         if (firstLine && firstLine.length < 100) title = firstLine;
     }

     return {
        user_email: email,
        content: content,
        title: title,
     };
  });

  await supabaseAdmin.from('rss_contents').insert(rows);
};

// 샘플 읽기 (Review Generator용)
export const readBlogSamples = async (email: string): Promise<string[]> => {
    if (!email) return [];
    
    // rss_contents에서 내용을 가져오는데, title이 'Sample'이거나 
    // 그냥 모든 rss 컨텐츠를 샘플로 쓸 수도 있음.
    // 여기서는 최근 20개를 가져와서 섞어 쓰는 방식으로 구현
    const { data } = await supabaseAdmin
        .from('rss_contents')
        .select('content')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(20);
        
    return data ? data.map(d => d.content) : [];
}
