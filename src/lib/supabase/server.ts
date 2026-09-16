import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  getUnifiedSupabaseUrl,
  getUnifiedSupabaseServiceRoleKey,
} from './config';

export function getSupabaseUrl() {
  return getUnifiedSupabaseUrl();
}

export function getSupabaseKey() {
  return getUnifiedSupabaseServiceRoleKey();
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
