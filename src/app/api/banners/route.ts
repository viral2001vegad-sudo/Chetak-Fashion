import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Banner } from '@/types';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_BANNERS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

const BANNERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'banners.json');

function getStoredBanners(): Banner[] {
  try {
    if (fs.existsSync(BANNERS_FILE_PATH)) {
      const fileData = fs.readFileSync(BANNERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return MOCK_BANNERS;
}

function saveStoredBanners(banners: Banner[]) {
  try {
    const dirPath = path.dirname(BANNERS_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(BANNERS_FILE_PATH, JSON.stringify(banners, null, 2), 'utf-8');
  } catch (_) {
    // Graceful silent ignore on Vercel serverless environment
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      return NextResponse.json({ banners: data }, { status: 200 });
    }
  } catch (err) {
    console.warn('Error fetching banners from Supabase DB:', err);
  }

  const fallbackBanners = getStoredBanners();
  return NextResponse.json({ banners: fallbackBanners }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newBanner: Banner = {
      id: body.id || `banner-${Date.now()}`,
      title: body.title || 'Surat Direct Wholesale Manufacturer',
      subtitle: body.subtitle || 'Exclusive Dress Material Collections',
      badge: body.badge || 'SURAT DIRECT WHOLESALE',
      image_url: body.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
      link_url: body.link_url || '',
      is_active: body.is_active !== false,
      sort_order: body.sort_order || 1,
      created_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();
    const { error: dbError } = await supabase.from('banners').upsert(newBanner);

    if (dbError) {
      console.error('Supabase banner insert error:', dbError);
    }

    // Try fetching fresh list from Supabase
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    const currentList = Array.isArray(data) ? data : [newBanner];
    saveStoredBanners(currentList);

    return NextResponse.json({ success: true, banner: newBanner, banners: currentList }, { status: 201 });
  } catch (err: any) {
    console.error('Error saving banner:', err);
    return NextResponse.json({ error: 'Failed to save banner' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body.banners)) {
      const supabase = createAdminClient();
      for (const b of body.banners) {
        await supabase.from('banners').upsert(b);
      }

      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      const finalBanners = Array.isArray(data) ? data : body.banners;
      saveStoredBanners(finalBanners);

      return NextResponse.json({ success: true, banners: finalBanners });
    }
    return NextResponse.json({ error: 'Invalid banner array' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update banners' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('banners').delete().eq('id', id);

    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    const updatedList = Array.isArray(data) ? data : [];
    saveStoredBanners(updatedList);

    return NextResponse.json({ success: true, banners: updatedList });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
