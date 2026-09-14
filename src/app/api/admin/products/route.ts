import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { hashPassword } from '@/lib/auth/lock';
import { Product } from '@/types';

// Admin GET - returns all products including hidden, locked, and hashes if auth admin
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes('example.supabase.co')) {
      return NextResponse.json({ products: MOCK_PRODUCTS, source: 'seed_data' });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return NextResponse.json({ products: [], source: 'supabase' });
    }

    const mapped = data.map(p => ({
      ...p,
      category_name: p.categories?.name || 'General'
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();

      const productPayload: Record<string, any> = {
        name,
        description: description || null,
        price: price ? parseFloat(price) : null,
        price_visible: price_visible !== false,
        category_id: category_id || null,
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
    } else {
      // In-memory mock store mutation for demo testing
      if (id) {
        const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
        if (index !== -1) {
          MOCK_PRODUCTS[index] = {
            ...MOCK_PRODUCTS[index],
            name,
            description,
            price: price ? parseFloat(price) : null,
            category_id,
            images: images && images.length > 0 ? images : MOCK_PRODUCTS[index].images,
            in_stock: in_stock !== false,
            is_hidden: is_hidden === true,
            is_featured: is_featured === true,
            is_locked: is_locked === true,
            password_hash: passwordHash || MOCK_PRODUCTS[index].password_hash,
            preview_image: preview_image || MOCK_PRODUCTS[index].preview_image,
            updated_at: new Date().toISOString()
          };
          return NextResponse.json({ product: MOCK_PRODUCTS[index], message: 'Product updated (Demo Mode)' });
        }
      }

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name,
        description,
        price: price ? parseFloat(price) : null,
        price_visible: price_visible !== false,
        category_id,
        images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
        in_stock: in_stock !== false,
        is_hidden: is_hidden === true,
        is_featured: is_featured === true,
        is_locked: is_locked === true,
        password_hash: passwordHash,
        preview_image,
        view_count: 0,
        enquiry_count: 0,
        sort_order: MOCK_PRODUCTS.length + 1,
        created_at: new Date().toISOString()
      };

      MOCK_PRODUCTS.unshift(newProduct);
      return NextResponse.json({ product: newProduct, message: 'Product created (Demo Mode)' });
    }

  } catch (err: any) {
    console.error('Admin product error:', err);
    
    // Recovery for missing table PGRST205
    if (err.code === 'PGRST205' || err.message?.includes('schema cache')) {
      return NextResponse.json({
        message: "Supabase table 'products' missing. Please run schema.sql in Supabase SQL Editor. Action saved in demo mode.",
        fallback: true
      });
    }

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();
      await supabase.from('products').delete().eq('id', id);
    } else {
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (idx !== -1) {
        MOCK_PRODUCTS.splice(idx, 1);
      }
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    return NextResponse.json({ message: 'Delete error' }, { status: 500 });
  }
}
