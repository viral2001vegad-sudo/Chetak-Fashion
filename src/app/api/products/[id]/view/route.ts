import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const supabase = createAdminClient();
    const { error: rpcError } = await supabase.rpc('increment_view_count', { product_id: productId });
    if (rpcError) {
      const { data } = await supabase.from('products').select('view_count').eq('id', productId).single();
      if (data) {
        await supabase.from('products').update({ view_count: (data.view_count || 0) + 1 }).eq('id', productId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
