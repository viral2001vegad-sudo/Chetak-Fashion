import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
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

// Admin POST - add or update category directly in Supabase DB
export async function POST(req: NextRequest) {
  let categoryName = 'New Category';
  try {
    const body = await req.json();
    const { id, name, sort_order } = body;
    if (name && typeof name === 'string') categoryName = name.trim();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (id && isUUID(id)) {
      // Update existing category in Supabase
      const { data, error } = await supabase
        .from('categories')
        .update({ name: categoryName, sort_order: sort_order || 0 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      const categories = await getAllCategories(supabase);
      return NextResponse.json({ category: data, categories, message: 'Category updated in Supabase' });
    } else {
      // Insert new category in Supabase
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: categoryName, sort_order: sort_order || 0 })
        .select()
        .single();

      if (error) throw error;
      const categories = await getAllCategories(supabase);
      return NextResponse.json({ category: data, categories, message: 'Category added to Supabase' });
    }
  } catch (err: any) {
    console.error('Category save error:', err);
    return NextResponse.json({ message: 'Category save error' }, { status: 500 });
  }
}

// Admin DELETE - delete category directly from Supabase DB
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Category ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (isUUID(id)) {
      await supabase.from('categories').delete().eq('id', id);
    }

    const categories = await getAllCategories(supabase);
    return NextResponse.json({ success: true, categories, message: 'Category deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Category delete error' }, { status: 500 });
  }
}
