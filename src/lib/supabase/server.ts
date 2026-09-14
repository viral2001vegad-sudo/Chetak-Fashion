import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://shafiioaxfvtjfahumvv.supabase.co';
const FALLBACK_KEY = typeof Buffer !== 'undefined'
  ? Buffer.from('c2Jfc2VjcmV0X21OSmQ4c29OeGtyeW5wbmpQWU40Z195Skg5UWMwSA==', 'base64').toString('ascii')
  : 'sb_secret_mNJd8soNxkrynpnjPYN4g_yJH9Qc0H';

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
}

export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
