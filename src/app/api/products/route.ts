import { NextResponse } from 'next/server';
import { createAdminClient, getSupabaseUrl } from '@/lib/supabase/server';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { sanitizeProductForPublic } from '@/lib/auth/lock';
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

    const categoriesList = (dbCategories && dbCategories.length > 0) ? dbCategories : MOCK_CATEGORIES;
    const catMap: Record<string, string> = {};
    categoriesList.forEach(c => { catMap[c.id] = c.name; });

    // 2. Fetch products safely without fragile join dependency
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true });

    let finalProducts: Product[] = [];

    if (!prodError && dbProducts && dbProducts.length > 0) {
      finalProducts = dbProducts.map(p => ({
        ...p,
        category_name: p.category_id ? (catMap[p.category_id] || 'General') : 'General'
      }));
    } else {
      console.warn('Supabase products empty or error, falling back to mock catalogue:', prodError);
      finalProducts = MOCK_PRODUCTS;
    }

    // CRITICAL SECURITY: Sanitize products before returning to public client!
    const publicProducts = finalProducts.map(sanitizeProductForPublic);

    return NextResponse.json({
      products: publicProducts,
      categories: categoriesList,
      source: dbProducts && dbProducts.length > 0 ? 'supabase' : 'fallback',
      url_used: getSupabaseUrl()
    });

  } catch (err: any) {
    console.error('Error fetching products:', err);
    return NextResponse.json({
      products: MOCK_PRODUCTS.map(sanitizeProductForPublic),
      categories: MOCK_CATEGORIES,
      error: err?.message || String(err),
      url_used: getSupabaseUrl(),
      source: 'fallback'
    });
  }
}
