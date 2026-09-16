import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getSupabaseUrl } from '@/lib/supabase/server';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { sanitizeProductForPublic } from '@/lib/auth/lock';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const supabase = createAdminClient();

    // 1. Fetch categories
    const { data: dbCategories } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    const categoriesList = Array.isArray(dbCategories) ? dbCategories : [];
    const catMap: Record<string, string> = {};
    categoriesList.forEach(c => { catMap[c.id] = c.name; });

    // 2. Fetch target product
    let targetProduct: Product | undefined;

    const { data: dbProduct, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!prodError && dbProduct) {
      targetProduct = {
        ...dbProduct,
        category_name: dbProduct.category_id ? (catMap[dbProduct.category_id] || 'General') : 'General'
      };
    }

    if (!targetProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const publicProduct = sanitizeProductForPublic(targetProduct);

    return NextResponse.json({
      product: publicProduct,
      category_name: targetProduct.category_id ? (catMap[targetProduct.category_id] || 'General') : 'General'
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
