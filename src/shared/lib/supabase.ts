import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not defined');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY is not defined');
}

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


export type ApprovedUser = {
  id: string;
  email: string;
  approved_at: string;
  bmac_transaction_id: string | null;
  notes: string | null;
  created_at: string;
};

export type UserStyle = {
  id: string;
  user_email: string;
  blog_name: string | null;
  style_data: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type UserReview = {
  id: string;
  user_email: string;
  restaurant_name: string;
  location: string | null;
  visit_date: string | null;
  review_content: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};