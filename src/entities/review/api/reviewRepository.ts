import { supabaseAdmin } from '@/shared/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { Review } from '@/entities/review/model/review';

/**
 * 현재 로그인한 사용자의 리뷰 목록 조회
 */
export async function getReviews(): Promise<Review[]> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('user_reviews')
      .select('*')
      .eq('user_email', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('리뷰 조회 실패:', error);
      return [];
    }

    return (data || []).map((review) => ({
      id: review.id,
      storeName: review.restaurant_name,
      date: review.visit_date || review.created_at.split('T')[0],
      createdAt: review.created_at,
      content: review.review_content,
      characterCount: review.review_content.length,
    }));
  } catch (error) {
    console.error('리뷰 조회 중 오류:', error);
    return [];
  }
}

/**
 * ID로 특정 리뷰 조회
 */
export async function getReviewById(id: string): Promise<Review | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('user_reviews')
      .select('*')
      .eq('id', id)
      .eq('user_email', session.user.email)
      .single();

    if (error || !data) {
      console.error('리뷰 조회 실패:', error);
      return null;
    }

    return {
      id: data.id,
      storeName: data.restaurant_name,
      date: data.visit_date || data.created_at.split('T')[0],
      createdAt: data.created_at,
      content: data.review_content,
      characterCount: data.review_content.length,
    };
  } catch (error) {
    console.error('리뷰 조회 중 오류:', error);
    return null;
  }
}

export async function deleteReview(id: string): Promise<void> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('인증 필요');
  }

  const { error } = await supabaseAdmin
    .from('user_reviews')
    .delete()
    .eq('id', id)
    .eq('user_email', session.user.email);

  if (error) {
    throw new Error('리뷰 삭제 실패: ' + error.message);
  }
}

export async function updateReview(id: string, content: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error('인증 필요');
    }

    const { error } = await supabaseAdmin
      .from('user_reviews')
      .update({
        review_content: content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_email', session.user.email);

    if (error) {
      throw new Error('리뷰 수정 실패: ' + error.message);
    }
  } catch (error) {
    console.error('리뷰 수정 중 오류:', error);
    throw error;
  }
}
