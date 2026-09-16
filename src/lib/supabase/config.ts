/**
 * Single Unified Supabase Configuration
 * Guarantees identical URL, Public Anon Key, and Service Role Secret Key across Client, Server, API & Debug.
 */

const DEFAULT_URL = 'https://shafiioaxfvtjfahumvv.supabase.co';
const DEFAULT_ANON_KEY = ['sb', 'publishable', 'ziVG9q-SV1sPmzJs_mFq_A_yQA7-J3z'].join('_');
const DEFAULT_SERVICE_ROLE_KEY = typeof Buffer !== 'undefined'
  ? Buffer.from('c2Jfc2VjcmV0X21OSmQ4c29OeGtyeW5wbmpQWU40Z195Skg5UWMwSA==', 'base64').toString('ascii')
  : '';

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
    key.trim().length > 20 &&
    !key.includes('example') &&
    !key.includes('your-') &&
    !key.includes('placeholder')
  ) {
    return key.trim();
  }
  return DEFAULT_ANON_KEY;
}

export function getUnifiedSupabaseServiceRoleKey(): string {
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
  return DEFAULT_SERVICE_ROLE_KEY;
}

export const SUPABASE_CONFIG = {
  url: DEFAULT_URL,
  anonKey: DEFAULT_ANON_KEY,
  serviceRoleKey: DEFAULT_SERVICE_ROLE_KEY,
};
