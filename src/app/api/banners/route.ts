import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Banner } from '@/types';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BANNERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'banners.json');

function getStoredBanners(): Banner[] {
  try {
    if (fs.existsSync(BANNERS_FILE_PATH)) {
      const fileData = fs.readFileSync(BANNERS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading banners.json file:', err);
  }
  return [];
}

function saveStoredBanners(banners: Banner[]) {
  try {
    const dirPath = path.dirname(BANNERS_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(BANNERS_FILE_PATH, JSON.stringify(banners, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing banners.json file:', err);
  }
}

export async function GET() {
  try {
    // 1. Try Supabase DB
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({ banners: data }, { status: 200 });
      }
    } catch (_) {}

    // 2. Fallback to file storage
    const banners = getStoredBanners();
    return NextResponse.json({ banners }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ banners: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = getStoredBanners();

    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: body.title || 'Surat Direct Wholesale Manufacturer',
      subtitle: body.subtitle || 'Exclusive Dress Material Collections',
      badge: body.badge || 'SURAT DIRECT WHOLESALE',
      image_url: body.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
      link_url: body.link_url || '',
      is_active: body.is_active !== false,
      sort_order: existing.length + 1,
      created_at: new Date().toISOString(),
    };

    // Save to local file
    const updatedList = [newBanner, ...existing];
    saveStoredBanners(updatedList);

    // Save to Supabase DB
    try {
      const supabase = createAdminClient();
      await supabase.from('banners').insert(newBanner);
      
      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (Array.isArray(data)) {
        return NextResponse.json({ success: true, banner: newBanner, banners: data }, { status: 201 });
      }
    } catch (_) {}

    return NextResponse.json({ success: true, banner: newBanner, banners: updatedList }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save banner' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body.banners)) {
      saveStoredBanners(body.banners);

      try {
        const supabase = createAdminClient();
        for (const b of body.banners) {
          await supabase.from('banners').upsert(b);
        }
        const { data } = await supabase
          .from('banners')
          .select('*')
          .order('sort_order', { ascending: true });

        if (Array.isArray(data)) {
          return NextResponse.json({ success: true, banners: data });
        }
      } catch (_) {}

      return NextResponse.json({ success: true, banners: body.banners });
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

    const existing = getStoredBanners();
    const updatedList = existing.filter((b) => b.id !== id);
    saveStoredBanners(updatedList);

    try {
      const supabase = createAdminClient();
      await supabase.from('banners').delete().eq('id', id);

      const { data } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true });

      if (Array.isArray(data)) {
        return NextResponse.json({ success: true, banners: data });
      }
    } catch (_) {}

    return NextResponse.json({ success: true, banners: updatedList });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
