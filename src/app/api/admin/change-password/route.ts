import { NextRequest, NextResponse } from 'next/server';
import { updateAdminPassword } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required.' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required.' },
        { status: 400 }
      );
    }

    const result = await updateAdminPassword(currentPassword, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update admin password.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Admin password updated successfully!' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Change admin password error:', err);
    return NextResponse.json(
      { error: 'Server error while changing admin password.' },
      { status: 500 }
    );
  }
}

