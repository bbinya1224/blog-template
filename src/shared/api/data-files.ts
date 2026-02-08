import { supabaseAdmin } from '@/shared/lib/supabase';
import type { ReviewPayload } from '@/shared/types/review';
import type { StyleProfile } from '@/shared/types/style-profile';

export const readBlogPosts = async (email: string): Promise<string> => {
  if (!email) return '';

  const { data, error } = await supabaseAdmin
    .from('rss_contents')
    .select('content')
    .eq('user_email', email)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data) {
    return '';
  }

  return data.map((item) => item.content).join('\n\n---\n\n');
};

export const saveBlogPosts = async (
  email: string,
  content: string,
): Promise<void> => {
  if (!email) return;

  // Legacy bulk import - kept for backward compatibility
  await supabaseAdmin.from('rss_contents').insert({
    user_email: email,
    content: content,
    title: 'Bulk Text Import',
    created_at: new Date().toISOString(),
  });
};

export const readStyleProfile = async (
  email: string,
): Promise<StyleProfile | null> => {
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

export const saveStyleProfile = async (
  email: string,
  profile: StyleProfile,
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

export const saveReviewToDB = async (
  email: string,
  review: string,
  payload: ReviewPayload,
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

// Deprecated: kept for backward compatibility
export const saveReviewToFile = async (): Promise<string> => {
  throw new Error(
    'saveReviewToFile is deprecated. Use saveReviewToDB instead.',
  );
};

export const saveBlogSamples = async (email: string, samples: string[]) => {
  if (!email || samples.length === 0) return;

  const rows = samples.map((sample) => {
    let title = 'Sample';
    const content = sample;
    if (sample.length > 200) {
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

export const readBlogSamples = async (email: string): Promise<string[]> => {
  if (!email) return [];

  // Fetch recent 20 entries as writing samples for review generation
  const { data } = await supabaseAdmin
    .from('rss_contents')
    .select('content')
    .eq('user_email', email)
    .order('created_at', { ascending: false })
    .limit(20);

  return data ? data.map((d) => d.content) : [];
};

export const getUserStatus = async (email: string) => {
  if (!email) return null;

  const { data, error } = await supabaseAdmin
    .from('approved_users')
    .select('email, is_preview, usage_count')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};

export const incrementUsageCount = async (email: string) => {
  if (!email) return;

  await supabaseAdmin.rpc('increment_usage_count', { user_email: email });
};
