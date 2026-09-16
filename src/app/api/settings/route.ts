import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { DEFAULT_BUSINESS_CONFIG } from '@/config/business';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('store_settings')
      .select('config')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data && data.config) {
      return NextResponse.json({ config: { ...DEFAULT_BUSINESS_CONFIG, ...data.config } });
    }
  } catch (err) {
    console.warn('Public store_settings fetch error:', err);
  }

  return NextResponse.json({ config: DEFAULT_BUSINESS_CONFIG });
}
