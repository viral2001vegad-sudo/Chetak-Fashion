import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_ids } = body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json({ message: 'No product IDs provided' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();

      // Insert enquiry record
      await supabase.from('enquiries').insert({ product_ids });

      // Increment enquiry_count for each product
      for (const id of product_ids) {
        const { data } = await supabase.from('products').select('enquiry_count').eq('id', id).single();
        if (data) {
          await supabase.from('products').update({ enquiry_count: (data.enquiry_count || 0) + 1 }).eq('id', id);
        }
      }
    } else {
      // In-memory update for mock seed data during demo testing
      product_ids.forEach(id => {
        const prod = MOCK_PRODUCTS.find(p => p.id === id);
        if (prod) {
          prod.enquiry_count = (prod.enquiry_count || 0) + 1;
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Enquiry logged successfully' });

  } catch (err) {
    console.error('Error logging enquiry:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
