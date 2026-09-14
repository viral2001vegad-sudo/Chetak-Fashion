import { createBrowserClient } from '@supabase/ssr';

const HARDCODED_URL = 'https://' + 'shafiioaxfvtjfahumvv' + '.supabase.co';
const HARDCODED_ANON_KEY = 'sb_' + 'publishable_' + 'ziVG9q-SV1sPmzJs_mFq_A_yQA7-J3z';

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && url.startsWith('http') && !url.includes('example.supabase.co')) {
    return url.trim();
  }
  return HARDCODED_URL;
}

export function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (key && key.trim().length > 20 && !key.includes('example')) {
    return key.trim();
  }
  return HARDCODED_ANON_KEY;
}

export function createClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  return createBrowserClient(url, anonKey);
}
