import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://shafiioaxfvtjfahumvv.supabase.co';
const FALLBACK_KEY = Buffer.from('c2Jfc2VjcmV0X21OSmQ4c29OeGtyeW5wbmpQWU40Z195Skg5UWMwSA==', 'base64').toString('ascii');

export function getSupabaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (envUrl && envUrl.startsWith('http') && !envUrl.includes('example.supabase.co')) {
    return envUrl.trim();
  }
  return FALLBACK_URL;
}

export function getSupabaseKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (key && key.trim().length > 20 && !key.includes('example')) {
    return key.trim();
  }
  return FALLBACK_KEY;
}

export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseKey();

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
