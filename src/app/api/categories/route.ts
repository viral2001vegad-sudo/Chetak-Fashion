import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_CATEGORIES } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ categories: MOCK_CATEGORIES });
    }

    return NextResponse.json({ categories: data });
  } catch (err) {
    return NextResponse.json({ categories: MOCK_CATEGORIES });
  }
}
