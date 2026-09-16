import { NextResponse } from 'next/server';
import { createAdminClient, getSupabaseUrl } from '@/lib/supabase/server';
import { sanitizeProductForPublic } from '@/lib/auth/lock';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch categories
    const { data: dbCategories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catError) console.error('Supabase categories error:', catError);

    const categoriesList = Array.isArray(dbCategories) ? dbCategories : MOCK_CATEGORIES;
    const catMap: Record<string, string> = {};
    categoriesList.forEach(c => { catMap[c.id] = c.name; });

    // 2. Fetch products
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true });

    if (prodError) console.error('Supabase products error:', prodError);

    let finalProducts: Product[] = [];
    let isFallback = false;

    if (!prodError && Array.isArray(dbProducts) && dbProducts.length > 0) {
      finalProducts = dbProducts.map(p => ({
        ...p,
        category_name: p.category_id ? (catMap[p.category_id] || 'General') : 'General'
      }));
    } else {
      console.warn('Supabase products empty or error, using mock data. Prod error:', prodError);
      finalProducts = MOCK_PRODUCTS;
      isFallback = true;
    }

    const publicProducts = finalProducts.map(sanitizeProductForPublic);

    const response = NextResponse.json({
      products: publicProducts,
      categories: categoriesList.length > 0 ? categoriesList : MOCK_CATEGORIES,
      source: isFallback ? 'fallback' : 'supabase',
      url_used: getSupabaseUrl(),
      cat_error: catError ? catError.message : null,
      prod_error: prodError ? prodError.message : null,
      raw_count: Array.isArray(dbProducts) ? dbProducts.length : 0
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (err: any) {
    console.error('Error fetching products:', err);
    const errResponse = NextResponse.json({
      products: MOCK_PRODUCTS.map(sanitizeProductForPublic),
      categories: MOCK_CATEGORIES,
      error: err?.message || String(err),
      url_used: getSupabaseUrl(),
      source: 'fallback'
    });

    errResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return errResponse;
  }
}
