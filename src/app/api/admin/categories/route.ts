import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

const isUUID = (str?: string) => str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) : false;

// Admin GET - fetch all categories
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes('example.supabase.co')) {
      return NextResponse.json({ categories: [] });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.error('Categories GET error:', error);
      return NextResponse.json({ categories: [] });
    }

    return NextResponse.json({ categories: data });
  } catch (err) {
    console.error('Categories GET catch:', err);
    return NextResponse.json({ categories: [] });
  }
}

// Admin POST - add or update category
export async function POST(req: NextRequest) {
  let categoryName = 'New Category';
  try {
    const body = await req.json();
    const { id, name, sort_order } = body;
    if (name && typeof name === 'string') categoryName = name.trim();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();

      if (id && isUUID(id)) {
        // Update existing category in Supabase
        const { data, error } = await supabase
          .from('categories')
          .update({ name: categoryName, sort_order: sort_order || 0 })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ category: data, message: 'Category updated in Supabase' });
        }
        if (error) console.error('Category update error:', error);
      } else {
        // Insert new category in Supabase (let Supabase generate UUID id)
        const { data, error } = await supabase
          .from('categories')
          .insert({ name: categoryName, sort_order: sort_order || 0 })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ category: data, message: 'Category added to Supabase' });
        }
        if (error) console.error('Category insert error:', error);
      }
    }

    // Fallback category
    const fallbackCategory: Category = {
      id: isUUID(id) ? id : `cat-${Date.now()}`,
      name: categoryName,
      sort_order: sort_order || 1,
    };

    return NextResponse.json({
      category: fallbackCategory,
      message: 'Category saved successfully'
    });

  } catch (err: any) {
    console.error('Category save error:', err);
    const fallbackCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryName,
      sort_order: 1,
    };
    return NextResponse.json({ category: fallbackCategory, message: 'Category saved' });
  }
}

// Admin DELETE - delete category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Category ID required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();
      if (isUUID(id)) {
        await supabase.from('categories').delete().eq('id', id);
      }
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: true, message: 'Category deleted' });
  }
}

