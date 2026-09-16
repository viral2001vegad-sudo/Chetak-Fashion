import { NextRequest, NextResponse } from 'next/server';
import { verifyOrRegisterDevice } from '@/lib/auth/deviceLock';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, token } = body;

    if (!token) {
      return NextResponse.json(
        { authorized: false, error: 'Unauthorized admin session token missing.' },
        { status: 401 }
      );
    }

    if (!deviceId) {
      return NextResponse.json(
        { authorized: false, error: 'Browser device ID is missing.' },
        { status: 400 }
      );
    }

    const check = await verifyOrRegisterDevice(
      '00000000-0000-0000-0000-000000000001',
      deviceId
    );

    if (!check.authorized) {
      return NextResponse.json(
        {
          authorized: false,
          reason: check.reason || 'DEVICE_ALREADY_REGISTERED',
          message: check.message || 'This admin account is already authorized on another device. Please contact the developer to authorize this device.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ authorized: true }, { status: 200 });
  } catch (err: any) {
    console.error('Device verify API error:', err);
    return NextResponse.json(
      { authorized: false, error: 'Server error during device verification.' },
      { status: 500 }
    );
  }
}
