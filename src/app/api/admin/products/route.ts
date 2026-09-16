import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/lock';

export const dynamic = 'force-dynamic';

const isUUID = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

async function getAllProducts(supabase: any) {
  const { data: dbCats } = await supabase.from('categories').select('*');
  const catMap: Record<string, string> = {};
  (dbCats || []).forEach((c: any) => { catMap[c.id] = c.name; });

  const { data } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  return (data || []).map((p: any) => ({
    ...p,
    category_name: p.category_id ? (catMap[p.category_id] || 'General') : 'General'
  }));
}

// Admin GET - returns all products directly from Supabase DB
export async function GET() {
  try {
    const supabase = createAdminClient();
    const products = await getAllProducts(supabase);
    return NextResponse.json({ products, source: 'supabase' });
  } catch (err) {
    return NextResponse.json({ products: [], source: 'error' });
  }
}

// Admin POST - create or update product directly in Supabase DB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, volume, description, price, price_visible, category_id, images, in_stock, is_hidden, is_featured, is_locked, password, preview_image } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Product name is required' }, { status: 400 });
    }

    let passwordHash: string | undefined = undefined;
    if (is_locked && password && password.trim().length > 0) {
      passwordHash = await hashPassword(password.trim());
    }

    const supabase = createAdminClient();

    const productPayload: Record<string, any> = {
      name,
      volume: volume ? String(volume).trim() : null,
      description: description || null,
      price: price ? parseFloat(price) : null,
      price_visible: price_visible !== false,
      category_id: isUUID(category_id) ? category_id : null,
      images: images && images.length > 0 ? images.slice(0, 2) : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
      in_stock: in_stock !== false,
      is_hidden: is_hidden === true,
      is_featured: is_featured === true,
      is_locked: is_locked === true,
      preview_image: preview_image || (images && images[0]) || null,
      updated_at: new Date().toISOString()
    };

    if (passwordHash) {
      productPayload.password_hash = passwordHash;
    }

    if (id && isUUID(id)) {
      // Update existing product
      const { data, error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const products = await getAllProducts(supabase);
      return NextResponse.json({ product: data, products, message: 'Product updated successfully' });
    } else {
      // Insert new product
      const { data, error } = await supabase
        .from('products')
        .insert(productPayload)
        .select()
        .single();

      if (error) throw error;
      const products = await getAllProducts(supabase);
      return NextResponse.json({ product: data, products, message: 'Product created successfully' });
    }

  } catch (err: any) {
    console.error('Admin product error:', err);
    return NextResponse.json({ message: err.message || 'Error processing product' }, { status: 500 });
  }
}

// Admin DELETE - Delete product from Supabase DB
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('products').delete().eq('id', id);

    const products = await getAllProducts(supabase);
    return NextResponse.json({ success: true, products, message: 'Product deleted successfully' });
  } catch (err) {
    return NextResponse.json({ message: 'Delete error' }, { status: 500 });
  }
}
