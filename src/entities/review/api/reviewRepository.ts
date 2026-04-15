import { supabaseAdmin } from '@/shared/lib/supabase';
import type { Review, ConversationMessage } from '@/entities/review/model/review';

export async function getReviews(userEmail: string, limit?: number): Promise<Review[]> {
  try {
    let query = supabaseAdmin
      .from('user_reviews')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('리뷰 조회 실패:', error);
      return [];
    }

    return (data || []).map((review) => {
      const content = review.review_content ?? '';
      return {
        id: review.id,
        storeName: review.restaurant_name,
        date: review.visit_date || review.created_at.split('T')[0],
        createdAt: review.created_at,
        content,
        characterCount: content.length,
        conversation: [],
      };
    });
  } catch (error) {
    console.error('리뷰 조회 중 오류:', error);
    return [];
  }
}

export async function getReviewById(id: string, userEmail: string): Promise<Review | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_reviews')
      .select('*')
      .eq('id', id)
      .eq('user_email', userEmail)
      .single();

    if (error || !data) {
      console.error('리뷰 조회 실패:', error);
      return null;
    }

    const content = data.review_content ?? '';
    return {
      id: data.id,
      storeName: data.restaurant_name,
      date: data.visit_date || data.created_at.split('T')[0],
      createdAt: data.created_at,
      content,
      characterCount: content.length,
      conversation: (data.conversation as ConversationMessage[] | null) ?? [],
    };
  } catch (error) {
    console.error('리뷰 조회 중 오류:', error);
    return null;
  }
}

export async function deleteReview(id: string, userEmail: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('user_reviews')
    .delete()
    .eq('id', id)
    .eq('user_email', userEmail)
    .select('id');

  if (error) {
    throw new Error('리뷰 삭제 실패: ' + error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('삭제할 리뷰를 찾을 수 없습니다.');
  }
}

export async function updateReview(
  id: string,
  userEmail: string,
  content: string,
  conversation?: ConversationMessage[]
): Promise<void> {
  const updateData: Record<string, unknown> = {
    review_content: content,
    updated_at: new Date().toISOString(),
  };

  if (conversation !== undefined) {
    updateData.conversation = conversation;
  }

  const { error } = await supabaseAdmin
    .from('user_reviews')
    .update(updateData)
    .eq('id', id)
    .eq('user_email', userEmail);

  if (error) {
    throw new Error('리뷰 수정 실패: ' + error.message);
  }
}
