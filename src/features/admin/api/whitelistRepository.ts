import { supabaseAdmin } from '@/shared/lib/supabase';

type WhitelistUser = {
  id: string;
  email: string;
  approved_at: string | null;
  bmac_transaction_id: string | null;
  notes: string | null;
  created_at: string | null;
  is_preview: boolean | null;
  usage_count: number | null;
};

export const getAllUsers = async (): Promise<WhitelistUser[]> => {
  const { data, error } = await supabaseAdmin
    .from('approved_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('화이트리스트 조회 실패:', error);
    throw error;
  }

  return data || [];
};

export const getUserByEmail = async (
  email: string
): Promise<WhitelistUser | null> => {
  const { data, error } = await supabaseAdmin
    .from('approved_users')
    .select('*')
    .eq('email', email)
    .single();

  // PGRST116 = no rows returned
  if (error && error.code !== 'PGRST116') {
    console.error('사용자 조회 실패:', error);
    throw error;
  }

  return data;
};

export const addUser = async (email: string, notes?: string): Promise<void> => {
  const { error } = await supabaseAdmin.from('approved_users').insert({
    email,
    notes: notes || '관리자 수동 승인',
    is_preview: true,
  });

  if (error) {
    console.error('사용자 추가 실패:', error);
    throw error;
  }
};

export const updateUser = async (
  email: string,
  updates: { is_preview?: boolean; usage_count?: number }
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('approved_users')
    .update(updates)
    .eq('email', email);

  if (error) {
    console.error('사용자 업데이트 실패:', error);
    throw error;
  }
};

export const deleteUser = async (email: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('approved_users')
    .delete()
    .eq('email', email);

  if (error) {
    console.error('사용자 삭제 실패:', error);
    throw error;
  }
};
