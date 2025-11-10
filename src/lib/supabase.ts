import { createClient } from '@supabase/supabase-js';

// Vite env var names expected:
// VITE_SUPABASE_URL=
// VITE_SUPABASE_ANON_KEY=
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database types
export interface DatabaseUser {
  id: string;
  email: string;
  mobile: string;
  password: string; // In production, this should be hashed in Supabase Auth
  name: string;
  profile_type: 'bride' | 'groom';
  phone?: string;
  date_of_birth?: string;
  height?: string;
  education?: string;
  occupation?: string;
  salary?: string;
  city?: string;
  state?: string;
  religion?: string;
  mother_tongue?: string;
  family_type?: string;
  about?: string;
  profile_image?: string;
  profile_images?: string[]; // Array of image URLs for multiple photos
  is_profile_complete: boolean;
  status: 'pending' | 'approved' | 'rejected';
  role?: 'admin' | 'user';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  created_by_admin?: string;
}

