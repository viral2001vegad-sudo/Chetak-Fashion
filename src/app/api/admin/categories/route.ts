import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { Category } from '@/types';

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
      return NextResponse.json({ categories: [] });
    }

    return NextResponse.json({ categories: data });
  } catch (err) {
    return NextResponse.json({ categories: [] });
  }
}

// Admin POST - add or update category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, sort_order } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();

      if (id && !id.startsWith('cat-demo-')) {
        // Update existing category
        const { data, error } = await supabase
          .from('categories')
          .update({ name: name.trim(), sort_order: sort_order || 0 })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ category: data, message: 'Category updated in Supabase' });
      } else {
        // Insert new category
        const { data, error } = await supabase
          .from('categories')
          .insert({ name: name.trim(), sort_order: sort_order || 0 })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ category: data, message: 'Category added to Supabase' });
      }
    } else {
      // Demo fallback mode
      const category: Category = {
        id: id || `cat-${Date.now()}`,
        name: name.trim(),
        sort_order: sort_order || 1,
      };
      return NextResponse.json({ category, message: 'Category saved (Demo Mode)' });
    }
  } catch (err: any) {
    console.error('Category save error:', err);
    return NextResponse.json({ message: err.message || 'Error saving category' }, { status: 500 });
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
      await supabase.from('categories').delete().eq('id', id);
    }

    return NextResponse.json({ success: true, message: 'Category deleted from Supabase' });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}
