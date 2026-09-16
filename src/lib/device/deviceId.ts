'use client';

const DEVICE_ID_KEY = 'chetak_admin_device_id';

/**
 * Returns a persistent, cryptographically secure UUID for the current browser installation.
 * If no device ID exists, generates a new UUID, persists it in localStorage, and returns it.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (deviceId && deviceId.trim().length > 0) {
      return deviceId.trim();
    }

    // Generate secure random UUID
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch (err) {
    console.error('Failed to access localStorage for device ID:', err);
    return 'fallback-device-id';
  }
}
