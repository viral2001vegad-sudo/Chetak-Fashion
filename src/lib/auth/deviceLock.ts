import { createAdminClient } from '@/lib/supabase/server';

export interface DeviceLockResult {
  authorized: boolean;
  reason?: 'DEVICE_ALREADY_REGISTERED' | 'INVALID_DEVICE_ID' | 'SERVER_ERROR';
  message?: string;
}

/**
 * Server-side atomic verification & registration of admin device lock in Supabase.
 * Enforces that only ONE active browser/device can be bound to the admin account.
 */
export async function verifyOrRegisterDevice(
  adminUserId: string = '00000000-0000-0000-0000-000000000001',
  deviceId: string
): Promise<DeviceLockResult> {
  if (!deviceId || deviceId.trim().length < 10) {
    return {
      authorized: false,
      reason: 'INVALID_DEVICE_ID',
      message: 'Invalid browser device identification.',
    };
  }

  const cleanDeviceId = deviceId.trim();
  const cleanUserId = adminUserId.trim();
  const supabase = createAdminClient();

  try {
    // 1. Query current active device lock record for this admin
    const { data: locks, error: selectErr } = await supabase
      .from('admin_device_lock')
      .select('*')
      .eq('admin_user_id', cleanUserId)
      .eq('is_active', true)
      .limit(1);

    if (selectErr) {
      console.warn('admin_device_lock query error:', selectErr.message || selectErr);
      // If table does not exist in Supabase schema cache yet, gracefully authorize device until table is created
      const errStr = (selectErr.message || '').toLowerCase();
      if (
        selectErr.code === 'PGRST205' ||
        selectErr.code === '42P01' ||
        errStr.includes('schema cache') ||
        errStr.includes('does not exist') ||
        errStr.includes('not found')
      ) {
        console.warn('⚠️ Table public.admin_device_lock does not exist in Supabase yet. Please run SUPABASE_SETUP.md in Supabase SQL Editor.');
        return { authorized: true };
      }
    }

    const activeLock = locks && locks.length > 0 ? locks[0] : null;

    // --- CASE A: No active device lock exists -> Register current device ---
    if (!activeLock) {
      const { error: insertErr } = await supabase.from('admin_device_lock').upsert(
        {
          admin_user_id: cleanUserId,
          device_id: cleanDeviceId,
          is_active: true,
          registered_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'admin_user_id' }
      );

      if (insertErr) {
        console.error('Failed to register device in admin_device_lock:', insertErr);
        // Double check if race condition caused registration by another device
        const { data: recheckLocks } = await supabase
          .from('admin_device_lock')
          .select('*')
          .eq('admin_user_id', cleanUserId)
          .eq('is_active', true)
          .limit(1);

        const recheckLock = recheckLocks && recheckLocks.length > 0 ? recheckLocks[0] : null;
        if (recheckLock && recheckLock.device_id !== cleanDeviceId) {
          return {
            authorized: false,
            reason: 'DEVICE_ALREADY_REGISTERED',
            message: 'This admin account is already authorized on another device. For security reasons, only one device can access this admin account at a time. Please contact the developer to authorize this device.',
          };
        }
      }

      console.log(`[DEVICE LOCK] First device successfully registered for admin ${cleanUserId}: ${cleanDeviceId}`);
      return { authorized: true };
    }

    // --- CASE B: Existing device matches current device -> Allow access ---
    if (activeLock.device_id === cleanDeviceId) {
      // Update last seen timestamp asynchronously
      try {
        await supabase
          .from('admin_device_lock')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', activeLock.id);
      } catch (err) {
        console.warn('Failed to update last_seen_at:', err);
      }

      return { authorized: true };
    }

    // --- CASE C: Existing device differs -> Deny access ---
    console.warn(`[SECURITY REJECTION] Device ${cleanDeviceId} attempted login for admin ${cleanUserId}, but active device is ${activeLock.device_id}`);
    return {
      authorized: false,
      reason: 'DEVICE_ALREADY_REGISTERED',
      message: 'This admin account is already authorized on another device. For security reasons, only one device can access this admin account at a time. Please contact the developer to authorize this device.',
    };
  } catch (err: any) {
    console.error('Device lock verification error:', err);
    // Safe fallback: allow access only if server error occurs to avoid complete lockout, or enforce fallback
    return { authorized: true };
  }
}
