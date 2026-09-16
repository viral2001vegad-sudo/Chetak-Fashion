import { createBrowserClient } from '@supabase/ssr';
import {
  getUnifiedSupabaseUrl,
  getUnifiedSupabaseAnonKey,
} from './config';

export function getSupabaseUrl() {
  return getUnifiedSupabaseUrl();
}

export function getSupabaseAnonKey() {
  return getUnifiedSupabaseAnonKey();
}

export function createClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  return createBrowserClient(url, anonKey);
}
