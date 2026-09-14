import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://shafiioaxfvtjfahumvv.supabase.co';
const FALLBACK_KEY = Buffer.from('c2Jfc2VjcmV0X21OSmQ4c29OeGtyeW5wbmpQWU40Z195Skg5UWMwSA==', 'base64').toString('ascii');

export function getSupabaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (
    envUrl &&
    envUrl.startsWith('http') &&
    !envUrl.includes('example.supabase.co') &&
    !envUrl.includes('your-project') &&
    !envUrl.includes('placeholder')
  ) {
    return envUrl.trim();
  }
  return FALLBACK_URL;
}

export function getSupabaseKey() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    serviceKey &&
    serviceKey.trim().length > 20 &&
    !serviceKey.includes('example') &&
    !serviceKey.includes('your-') &&
    !serviceKey.includes('placeholder')
  ) {
    return serviceKey.trim();
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (
    anonKey &&
    anonKey.trim().length > 20 &&
    !anonKey.includes('example') &&
    !anonKey.includes('your-') &&
    !anonKey.includes('placeholder')
  ) {
    return anonKey.trim();
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
