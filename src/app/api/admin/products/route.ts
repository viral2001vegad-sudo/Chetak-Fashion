import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { hashPassword } from '@/lib/auth/lock';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

const isUUID = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

// Admin GET - returns all products including hidden, locked, and hashes if auth admin
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Fetch categories for category name mapping
    const { data: dbCats } = await supabase.from('categories').select('*');
    const catMap: Record<string, string> = {};
    (dbCats || []).forEach(c => { catMap[c.id] = c.name; });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return NextResponse.json({ products: [], source: 'supabase' });
    }

    const mapped = data.map(p => ({
      ...p,
      category_name: p.category_id ? (catMap[p.category_id] || 'General') : 'General'
    }));

    return NextResponse.json({ products: mapped, source: 'supabase' });

  } catch (err) {
    return NextResponse.json({ products: [], source: 'fallback' });
  }
}

// Admin POST - create or update product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, price, price_visible, category_id, images, in_stock, is_hidden, is_featured, is_locked, password, preview_image } = body;

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
      description: description || null,
      price: price ? parseFloat(price) : null,
      price_visible: price_visible !== false,
      category_id: isUUID(category_id) ? category_id : null,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
      in_stock: in_stock !== false,
      is_hidden: is_hidden === true,
      is_featured: is_featured === true,
      is_locked: is_locked === true,
      preview_image: preview_image || null,
      updated_at: new Date().toISOString()
    };

    if (passwordHash) {
      productPayload.password_hash = passwordHash;
    }

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ product: data, message: 'Product updated successfully' });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('products')
        .insert(productPayload)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ product: data, message: 'Product created successfully' });
    }

  } catch (err: any) {
    console.error('Admin product error:', err);
    return NextResponse.json({ message: err.message || 'Error processing product' }, { status: 500 });
  }
}

// Admin DELETE - Delete product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('products').delete().eq('id', id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    return NextResponse.json({ message: 'Delete error' }, { status: 500 });
  }
}
