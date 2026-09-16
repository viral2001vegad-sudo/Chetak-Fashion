import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, deleteStorageFiles } from '@/lib/supabase/server';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

const isUUID = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

async function getAllCategories(supabase: any) {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  return data || [];
}

// Admin GET - fetch all categories directly from Supabase DB
export async function GET() {
  try {
    const supabase = createAdminClient();
    const categories = await getAllCategories(supabase);
    return NextResponse.json({ categories });
  } catch (err) {
    console.error('Categories GET catch:', err);
    return NextResponse.json({ categories: [] });
  }
}

async function saveCategoryWithAutoColumn(supabase: any, catPayload: Record<string, any>, id?: string) {
  let res: any;
  if (id && isUUID(id)) {
    res = await supabase.from('categories').update(catPayload).eq('id', id).select().single();
  } else {
    res = await supabase.from('categories').insert(catPayload).select().single();
  }

  if (res.error && (res.error.code === '42703' || res.error.message?.includes('image_url') || res.error.message?.includes('schema cache'))) {
    try {
      await supabase.rpc('exec_sql', { sql: 'ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;' });
      if (id && isUUID(id)) {
        res = await supabase.from('categories').update(catPayload).eq('id', id).select().single();
      } else {
        res = await supabase.from('categories').insert(catPayload).select().single();
      }
    } catch (_) {
      const fallbackPayload = { ...catPayload };
      delete fallbackPayload.image_url;
      if (id && isUUID(id)) {
        res = await supabase.from('categories').update(fallbackPayload).eq('id', id).select().single();
      } else {
        res = await supabase.from('categories').insert(fallbackPayload).select().single();
      }
    }
  }

  if (res.error) throw res.error;
  return res.data;
}

// Admin POST - add or update category directly in Supabase DB
export async function POST(req: NextRequest) {
  let categoryName = 'New Category';
  try {
    const body = await req.json();
    const { id, name, image_url, sort_order } = body;
    if (name && typeof name === 'string') categoryName = name.trim();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const catPayload: Record<string, any> = {
      name: categoryName,
      sort_order: sort_order || 0,
    };
    if (image_url !== undefined) {
      catPayload.image_url = image_url;
    }

    if (id && isUUID(id)) {
      // Fetch existing category to clean up removed cover image if replaced
      const { data: existingCat } = await supabase.from('categories').select('image_url').eq('id', id).single();
      if (existingCat?.image_url && existingCat.image_url !== image_url) {
        await deleteStorageFiles(supabase, [existingCat.image_url]);
      }

      const data = await saveCategoryWithAutoColumn(supabase, catPayload, id);
      const categories = await getAllCategories(supabase);
      return NextResponse.json({ category: data, categories, message: 'Category updated in Supabase' });
    } else {
      const data = await saveCategoryWithAutoColumn(supabase, catPayload);
      const categories = await getAllCategories(supabase);
      return NextResponse.json({ category: data, categories, message: 'Category added to Supabase' });
    }
  } catch (err: any) {
    console.error('Category save error:', err);
    return NextResponse.json({ message: err?.message || 'Category save error' }, { status: 500 });
  }
}

// Admin DELETE - delete category directly from Supabase DB & Storage
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Category ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (isUUID(id)) {
      const { data: cat } = await supabase.from('categories').select('image_url').eq('id', id).single();
      if (cat?.image_url) {
        await deleteStorageFiles(supabase, [cat.image_url]);
      }
      await supabase.from('categories').delete().eq('id', id);
    }

    const categories = await getAllCategories(supabase);
    return NextResponse.json({ success: true, categories, message: 'Category deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Category delete error' }, { status: 500 });
  }
}
