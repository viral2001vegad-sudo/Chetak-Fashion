import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { sanitizeProductForPublic } from '@/lib/auth/lock';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes('example.supabase.co')) {
      const activeProducts = MOCK_PRODUCTS
        .filter(p => !p.is_hidden)
        .map(sanitizeProductForPublic);

      return NextResponse.json({
        products: activeProducts,
        categories: MOCK_CATEGORIES,
        source: 'seed_data'
      });
    }

    const supabase = createAdminClient();

    // 1. Fetch categories
    const { data: dbCategories } = await supabase
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
      source: 'supabase'
    });

  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({
      products: [],
      categories: [],
      source: 'fallback'
    });
  }
}
