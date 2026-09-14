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

    const categoriesList = dbCategories || [];
    const catMap: Record<string, string> = {};
    categoriesList.forEach(c => { catMap[c.id] = c.name; });

    // 2. Fetch products safely without fragile join dependency
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true });

    if (prodError || !dbProducts) {
      console.error('Products fetch error:', prodError);
      return NextResponse.json({
        products: [],
        categories: categoriesList,
        prod_error: prodError || null,
        cat_error: catError || null,
        url_used: getSupabaseUrl(),
        source: 'supabase'
      });
    }

    const mappedProducts: Product[] = dbProducts.map(p => ({
      ...p,
      category_name: p.category_id ? (catMap[p.category_id] || 'General') : 'General'
    }));

    // CRITICAL SECURITY: Sanitize products before returning to public client!
    const publicProducts = mappedProducts.map(sanitizeProductForPublic);

    return NextResponse.json({
      products: publicProducts,
      categories: categoriesList,
      source: 'supabase',
      url_used: getSupabaseUrl()
    });

  } catch (err: any) {
    console.error('Error fetching products:', err);
    return NextResponse.json({
      products: [],
      categories: [],
      error: err?.message || String(err),
      url_used: getSupabaseUrl(),
      source: 'fallback'
    });
  }
}
