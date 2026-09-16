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
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          cache: 'no-store',
        });
      },
    },
  });
}

export function extractStoragePaths(urls: (string | null | undefined)[]): string[] {
  const paths: string[] = [];
  for (const url of urls) {
    if (!url || typeof url !== 'string') continue;
    if (url.startsWith('data:') || url.includes('unsplash.com')) continue;

    const match = url.match(/\/product-images\/(.+)$/);
    if (match && match[1]) {
      const cleanPath = decodeURIComponent(match[1].split('?')[0]);
      if (cleanPath && !paths.includes(cleanPath)) {
        paths.push(cleanPath);
      }
    }
  }
  return paths;
}

export async function deleteStorageFiles(supabase: any, urls: (string | null | undefined)[]) {
  try {
    const paths = extractStoragePaths(urls);
    if (paths.length === 0) return;

    const { error } = await supabase.storage.from('product-images').remove(paths);
    if (error) {
      console.error('Failed to delete images from Supabase storage:', error);
    } else {
      console.log('Successfully deleted storage images:', paths);
    }
  } catch (err) {
    console.error('Error deleting storage images:', err);
  }
}
