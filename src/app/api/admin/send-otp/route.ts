import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordChangeOtp } from '@/lib/auth/supabaseAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || 'vegadamit2003@gmail.com';

    const result = await sendPasswordChangeOtp(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send OTP email.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `OTP sent successfully to ${email}. Please check your email inbox and Spam folder.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Send OTP API error:', err);
    return NextResponse.json(
      { error: 'Server error while sending OTP.' },
      { status: 500 }
    );
  }
}
