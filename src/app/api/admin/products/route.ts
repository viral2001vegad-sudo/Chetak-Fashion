import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, deleteStorageFiles } from '@/lib/supabase/server';
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
    const { id, name, volume, description, price, price_visible, category_id, images, in_stock, is_hidden, is_featured, is_locked, password, preview_image, youtube_url, pdf_url, custom_fields } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Product name is required' }, { status: 400 });
    }

    let passwordHash: string | undefined = undefined;
    if (is_locked && password && password.trim().length > 0) {
      passwordHash = await hashPassword(password.trim());
    }

    const supabase = createAdminClient();

    // Safe category_id resolution to prevent PostgreSQL UUID / FK syntax errors
    let targetCatId: string | null = null;
    if (isUUID(category_id)) {
      targetCatId = category_id;
    } else {
      const { data: dbCats } = await supabase.from('categories').select('id').limit(1);
      if (dbCats && dbCats.length > 0 && dbCats[0].id) {
        targetCatId = dbCats[0].id;
      }
    }

    const defaultImages = ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'];
    const validImages = Array.isArray(images) && images.length > 0 ? images.slice(0, 5) : defaultImages;

    let finalName = name.trim();
    if (volume && String(volume).trim().length > 0) {
      const volStr = String(volume).trim();
      if (!/vol/i.test(finalName)) {
        finalName = `${finalName} (${volStr})`;
      }
    }

    // Clean & validate custom_fields array
    let sanitizedCustomFields: any[] = [];
    if (Array.isArray(custom_fields)) {
      sanitizedCustomFields = custom_fields
        .filter((cf: any) => cf && typeof cf === 'object' && cf.label && String(cf.label).trim().length > 0 && cf.value && String(cf.value).trim().length > 0)
        .map((cf: any) => ({ label: String(cf.label).trim(), value: String(cf.value).trim() }));
    }

    const productPayload: Record<string, any> = {
      name: finalName,
      description: description ? String(description).trim() : null,
      price: price ? parseFloat(String(price)) : null,
      price_visible: price_visible !== false,
      category_id: targetCatId,
      images: validImages,
      in_stock: in_stock !== false,
      is_hidden: is_hidden === true,
      is_featured: is_featured === true,
      is_locked: is_locked === true,
      preview_image: preview_image || validImages[0] || defaultImages[0],
      youtube_url: youtube_url ? String(youtube_url).trim() : null,
      pdf_url: pdf_url ? String(pdf_url).trim() : null,
      custom_fields: sanitizedCustomFields.length > 0 ? sanitizedCustomFields : null,
      updated_at: new Date().toISOString()
    };

    if (passwordHash) {
      productPayload.password_hash = passwordHash;
    }

    if (id && isUUID(id)) {
      // Fetch old images to clean up any removed photos from Supabase Storage
      const { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (existingProduct) {
        const oldUrls = [
          ...(Array.isArray(existingProduct.images) ? existingProduct.images : []),
          existingProduct.preview_image,
          existingProduct.pdf_url
        ].filter(Boolean);
        const newUrls = [...validImages, productPayload.preview_image, productPayload.pdf_url].filter(Boolean);
        const removedUrls = oldUrls.filter(u => u && !newUrls.includes(u));
        if (removedUrls.length > 0) {
          await deleteStorageFiles(supabase, removedUrls);
        }
      }

      // Update existing product with automatic fallback if columns don't exist yet
      let updateRes = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)
        .select()
        .single();

      if (updateRes.error && (updateRes.error.code === 'PGRST204' || updateRes.error.message?.includes('column'))) {
        console.warn('Supabase missing youtube_url/pdf_url/custom_fields column, retrying payload without missing columns...');
        delete productPayload.youtube_url;
        delete productPayload.pdf_url;
        delete productPayload.custom_fields;
        updateRes = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id)
          .select()
          .single();
      }

      if (updateRes.error) {
        console.error('Supabase update product error:', updateRes.error);
        return NextResponse.json({ message: updateRes.error.message || 'Error updating product' }, { status: 400 });
      }
      const products = await getAllProducts(supabase);
      return NextResponse.json({ product: updateRes.data, products, message: 'Product updated successfully' });
    } else {
      // Insert new product with automatic fallback if columns don't exist yet
      let insertRes = await supabase
        .from('products')
        .insert(productPayload)
        .select()
        .single();

      if (insertRes.error && (insertRes.error.code === 'PGRST204' || insertRes.error.message?.includes('column'))) {
        console.warn('Supabase missing youtube_url/pdf_url/custom_fields column, retrying payload without missing columns...');
        delete productPayload.youtube_url;
        delete productPayload.pdf_url;
        delete productPayload.custom_fields;
        insertRes = await supabase
          .from('products')
          .insert(productPayload)
          .select()
          .single();
      }

      if (insertRes.error) {
        console.error('Supabase insert product error:', insertRes.error);
        return NextResponse.json({ message: insertRes.error.message || 'Error creating product' }, { status: 400 });
      }
      const products = await getAllProducts(supabase);
      return NextResponse.json({ product: insertRes.data, products, message: 'Product created successfully' });
    }

  } catch (err: any) {
    console.error('Admin product error:', err);
    return NextResponse.json({ message: err.message || 'Error processing product' }, { status: 500 });
  }
}

// Admin DELETE - Delete product and its uploaded images from Supabase DB & Storage
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Product ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch product to clean up uploaded images from Supabase Storage
    const { data: product } = await supabase
      .from('products')
      .select('images, preview_image, pdf_url')
      .eq('id', id)
      .single();

    if (product) {
      const allImageUrls = [
        ...(Array.isArray(product.images) ? product.images : []),
        product.preview_image,
        product.pdf_url
      ];
      await deleteStorageFiles(supabase, allImageUrls);
    }

    // 2. Delete product record from database
    await supabase.from('products').delete().eq('id', id);

    const products = await getAllProducts(supabase);
    return NextResponse.json({ success: true, products, message: 'Product and associated images deleted successfully' });
  } catch (err: any) {
    console.error('Delete product error:', err);
    return NextResponse.json({ message: err?.message || 'Delete error' }, { status: 500 });
  }
}
