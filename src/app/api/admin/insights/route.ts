import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS, MOCK_PAGE_VIEWS_COUNT, MOCK_ENQUIRIES_COUNT } from '@/lib/mockData';
import { Product } from '@/types';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes('example.supabase.co')) {
      const topViewed = [...MOCK_PRODUCTS].sort((a, b) => b.view_count - a.view_count).slice(0, 5);
      const topEnquired = [...MOCK_PRODUCTS].sort((a, b) => b.enquiry_count - a.enquiry_count).slice(0, 5);

      return NextResponse.json({
        totalVisits: MOCK_PAGE_VIEWS_COUNT,
        totalEnquiries: MOCK_ENQUIRIES_COUNT,
        totalProducts: MOCK_PRODUCTS.length,
        hiddenProducts: MOCK_PRODUCTS.filter(p => p.is_hidden).length,
        lockedProducts: MOCK_PRODUCTS.filter(p => p.is_locked).length,
        outOfStockProducts: MOCK_PRODUCTS.filter(p => !p.in_stock).length,
        topViewed,
        topEnquired,
        source: 'seed_data'
      });
    }

    const supabase = createAdminClient();

    // Fetch page views count
    const { count: totalVisits } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    // Fetch enquiries count
    const { count: totalEnquiries } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true });

    // Fetch all products for stats calculation
    const { data: allProducts } = await supabase
      .from('products')
      .select('*');

    const productsList: Product[] = allProducts || [];

    const topViewed = [...productsList].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 10);
    const topEnquired = [...productsList].sort((a, b) => (b.enquiry_count || 0) - (a.enquiry_count || 0)).slice(0, 10);

    return NextResponse.json({
      totalVisits: totalVisits || 0,
      totalEnquiries: totalEnquiries || 0,
      totalProducts: productsList.length,
      hiddenProducts: productsList.filter(p => p.is_hidden).length,
      lockedProducts: productsList.filter(p => p.is_locked).length,
      outOfStockProducts: productsList.filter(p => !p.in_stock).length,
      topViewed,
      topEnquired,
      source: 'supabase'
    });

  } catch (err) {
    console.error('Insights fetch error:', err);
    return NextResponse.json({
      totalVisits: 0,
      totalEnquiries: 0,
      totalProducts: 0,
      hiddenProducts: 0,
      lockedProducts: 0,
      outOfStockProducts: 0,
      topViewed: [],
      topEnquired: [],
      source: 'fallback'
    });
  }
}
