import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { DEFAULT_BUSINESS_CONFIG, BusinessConfig } from '@/config/business';

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
    console.warn('Supabase store_settings fetch error:', err);
  }

  return NextResponse.json({ config: DEFAULT_BUSINESS_CONFIG });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const mergedConfig: BusinessConfig = {
      ...DEFAULT_BUSINESS_CONFIG,
      ...body,
    };

    if (body.phone) {
      mergedConfig.rawPhone = body.phone.replace(/\D/g, '');
    }
    if (body.whatsapp) {
      mergedConfig.whatsapp = body.whatsapp.replace(/\D/g, '');
    }

    // Persist to Supabase DB table store_settings
    await supabase.from('store_settings').upsert({
      id: 'main',
      config: mergedConfig,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, config: mergedConfig });
  } catch (err: any) {
    console.error('Error saving store_settings to Supabase:', err);
    return NextResponse.json({ error: 'Failed to save store settings to database' }, { status: 500 });
  }
}
