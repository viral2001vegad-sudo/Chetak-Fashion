import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { sanitizeProductForPublic } from '@/lib/auth/lock';
import { Product } from '@/types';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Fallback to mock data if default placeholder URL or unconfigured
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
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_hidden', false)
      .order('sort_order', { ascending: true });

    const { data: dbCategories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (prodError || !dbProducts) {
      return NextResponse.json({
        products: [],
        categories: dbCategories || [],
        source: 'supabase'
      });
    }

    const mappedProducts: Product[] = dbProducts.map(p => ({
      ...p,
      category_name: p.categories?.name || 'General'
    }));

    // CRITICAL SECURITY: Sanitize products before returning to public client!
    const publicProducts = mappedProducts.map(sanitizeProductForPublic);

    return NextResponse.json({
      products: publicProducts,
      categories: dbCategories || [],
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
