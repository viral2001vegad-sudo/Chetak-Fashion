import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getSupabaseUrl } from '@/lib/supabase/server';
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

    // Fetch target product, categories, and related products in parallel
    const [catRes, prodRes, relatedRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('products').select('*').eq('id', productId).single(),
      supabase.from('products').select('*').neq('id', productId).eq('is_hidden', false).limit(6)
    ]);

    const categoriesList = Array.isArray(catRes.data) ? catRes.data : [];
    const catMap: Record<string, string> = {};
    categoriesList.forEach(c => { catMap[c.id] = c.name; });

    if (prodRes.error || !prodRes.data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const targetProduct: Product = {
      ...prodRes.data,
      category_name: prodRes.data.category_id ? (catMap[prodRes.data.category_id] || 'General') : 'General'
    };

    const publicProduct = sanitizeProductForPublic(targetProduct);

    const relatedProducts = Array.isArray(relatedRes.data)
      ? relatedRes.data.map(p => sanitizeProductForPublic({
          ...p,
          category_name: p.category_id ? (catMap[p.category_id] || 'General') : 'General'
        }))
      : [];

    return NextResponse.json({
      product: publicProduct,
      relatedProducts,
      category_name: targetProduct.category_name
    });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

