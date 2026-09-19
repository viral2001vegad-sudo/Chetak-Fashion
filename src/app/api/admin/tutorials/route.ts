import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { TutorialVideo } from '@/types';

export const dynamic = 'force-dynamic';

const DEFAULT_TUTORIALS: TutorialVideo[] = [];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tutorial_videos')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      return NextResponse.json({ tutorials: data, source: 'supabase' });
    }

    return NextResponse.json({ tutorials: DEFAULT_TUTORIALS, source: 'fallback' });
  } catch (err: any) {
    return NextResponse.json({ tutorials: DEFAULT_TUTORIALS, source: 'error', error: err?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, video_url, thumbnail_url, category, action_text, action_url, sort_order } = body;

    if (!title || !video_url) {
      return NextResponse.json({ message: 'Title and Video URL are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const payload: Record<string, any> = {
      title: title.trim(),
      description: description ? String(description).trim() : null,
      video_url: video_url.trim(),
      thumbnail_url: thumbnail_url ? String(thumbnail_url).trim() : null,
      category: category ? String(category).trim() : 'Manage Catalog',
      action_text: action_text ? String(action_text).trim() : 'Add Products',
      action_url: action_url ? String(action_url).trim() : 'tab=products',
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
    };

    if (id && id.length > 10 && !id.startsWith('tut-')) {
      const { data, error } = await supabase
        .from('tutorial_videos')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const { data: all } = await supabase.from('tutorial_videos').select('*').order('sort_order', { ascending: true });
      return NextResponse.json({ tutorial: data, tutorials: all || [data], message: 'Tutorial updated successfully' });
    } else {
      const { data, error } = await supabase
        .from('tutorial_videos')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const { data: all } = await supabase.from('tutorial_videos').select('*').order('sort_order', { ascending: true });
      return NextResponse.json({ tutorial: data, tutorials: all || [data], message: 'Tutorial created successfully' });
    }
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error processing request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Tutorial ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.from('tutorial_videos').delete().eq('id', id);

    const { data: all } = await supabase.from('tutorial_videos').select('*').order('sort_order', { ascending: true });
    return NextResponse.json({ success: true, tutorials: all || [], message: 'Tutorial video deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Delete error' }, { status: 500 });
  }
}
