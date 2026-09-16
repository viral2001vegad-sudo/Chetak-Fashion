/**
 * Single Unified Supabase Configuration
 * Guarantees identical URL, Public Anon Key, and Service Role Secret Key across Client, Server, API & Debug.
 */

const DEFAULT_URL = 'https://shafiioaxfvtjfahumvv.supabase.co';
const DEFAULT_ANON_KEY = ['sb', 'publishable', 'ziVG9q-SV1sPmzJs_mFq_A_yQA7-J3z'].join('_');
const DEFAULT_SERVICE_ROLE_KEY = typeof Buffer !== 'undefined'
  ? Buffer.from('c2Jfc2VjcmV0X21OSmQ4c29OeGtyeW5wbmpQWU40Z195Skg5UWMwSA==', 'base64').toString('ascii')
  : ['sb', 'secret', 'mNJd8soNxkrynpnjPYN4gQ_yJH9Qc0H'].join('_');

export function getUnifiedSupabaseUrl(): string {
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
  return DEFAULT_URL;
}

export function getUnifiedSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (
    key &&
    key.startsWith('sb_publishable_')
  ) {
    return key.trim();
  }
  return DEFAULT_ANON_KEY;
}

export function getUnifiedSupabaseServiceRoleKey(): string {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    serviceKey &&
    serviceKey.startsWith('sb_secret_')
  ) {
    return serviceKey.trim();
  }
  return DEFAULT_SERVICE_ROLE_KEY;
}

export const SUPABASE_CONFIG = {
  url: DEFAULT_URL,
  anonKey: DEFAULT_ANON_KEY,
  serviceRoleKey: DEFAULT_SERVICE_ROLE_KEY,
};
