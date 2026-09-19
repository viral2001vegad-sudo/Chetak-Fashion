import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const isPdf = ext === 'pdf' || file.type === 'application/pdf';
    const contentType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');
    const folder = isPdf ? 'catalogs' : 'products';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const supabase = createAdminClient();

    // Ensure storage bucket 'product-images' exists or upload directly
    let uploadResult = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadResult.error && (uploadResult.error.message?.includes('not found') || (uploadResult.error as any).statusCode === '404')) {
      // Auto-create public bucket if missing
      await supabase.storage.createBucket('product-images', { public: true });
      
      // Retry upload
      uploadResult = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        });
    }

    if (uploadResult.error) {
      console.error('Supabase storage upload error:', uploadResult.error);
      // Fallback data URL if bucket is unconfigured in Supabase UI
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${contentType};base64,${base64}`;
      return NextResponse.json({ url: dataUrl, message: 'Uploaded as data URL fallback' });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: fileName,
      message: 'Image uploaded successfully to Supabase Storage'
    });

  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ message: err.message || 'File upload failed' }, { status: 500 });
  }
}
