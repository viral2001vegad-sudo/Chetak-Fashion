import { NextRequest, NextResponse } from 'next/server';
import { loginWithSupabaseAuth } from '@/lib/auth/supabaseAuth';
import { verifyOrRegisterDevice } from '@/lib/auth/deviceLock';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, deviceId } = body;

    // 1. Authenticate admin credentials with Supabase
    const result = await loginWithSupabaseAuth(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed.' },
        { status: 401 }
      );
    }

    // 2. Perform Single-Device Lock Verification
    if (deviceId) {
      const deviceCheck = await verifyOrRegisterDevice(
        result.adminUserId || '00000000-0000-0000-0000-000000000001',
        deviceId
      );

      if (!deviceCheck.authorized) {
        return NextResponse.json(
          {
            error: deviceCheck.message || 'This admin account is already authorized on another device. Please contact the developer to authorize this device.',
            reason: deviceCheck.reason || 'DEVICE_ALREADY_REGISTERED',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        token: result.token,
        message: 'Admin authenticated successfully via Supabase Auth.',
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

