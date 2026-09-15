import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminLogin } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const result = await verifyAdminLogin(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        token: result.token,
        message: 'Admin authenticated successfully.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Admin login API error:', err);
    return NextResponse.json(
      { error: 'Server error during admin authentication.' },
      { status: 500 }
    );
  }
}
