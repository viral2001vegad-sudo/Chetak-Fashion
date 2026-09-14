import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { checkRateLimit, resetRateLimit, verifyPassword } from '@/lib/auth/lock';
import { Product } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 }
      );
    }

    // IP Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anon-client';
    const rateLimitKey = `${ip}:${productId}`;

    const limitCheck = checkRateLimit(rateLimitKey);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          message: `Too many failed attempts. Please try again in ${Math.ceil(limitCheck.retryAfterSeconds / 60)} minutes.`,
          retryAfterSeconds: limitCheck.retryAfterSeconds
        },
        { status: 429 }
      );
    }

    let targetProduct: Product | undefined;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('example.supabase.co')) {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (data && !error) {
        targetProduct = data as Product;
      }
    }

    // Fallback to mock data lookup if database record not found or unconfigured
    if (!targetProduct) {
      targetProduct = MOCK_PRODUCTS.find(p => p.id === productId);
    }

    if (!targetProduct) {
      return NextResponse.json(
        { message: 'Incorrect password' }, // Generic message prevents user enumeration
        { status: 401 }
      );
    }

    if (!targetProduct.is_locked || !targetProduct.password_hash) {
      // Product is not locked, return full product
      const { password_hash, ...safeData } = targetProduct;
      return NextResponse.json({ product: safeData });
    }

    // Server-side bcrypt verification
    const isValid = await verifyPassword(password.trim(), targetProduct.password_hash);

    if (!isValid) {
      return NextResponse.json(
        {
          message: 'Incorrect password. Please verify and try again.',
          remainingAttempts: limitCheck.remainingAttempts
        },
        { status: 401 }
      );
    }

    // Password verified successfully! Reset rate limiting counter.
    resetRateLimit(rateLimitKey);

    // Return full unlocked product payload (images, price, description) without password_hash
    const { password_hash, ...unlockedProduct } = targetProduct;

    return NextResponse.json({
      product: unlockedProduct,
      success: true,
      message: 'Product unlocked successfully'
    });

  } catch (err) {
    console.error('Unlock error:', err);
    return NextResponse.json(
      { message: 'Server error during password verification' },
      { status: 500 }
    );
  }
}
