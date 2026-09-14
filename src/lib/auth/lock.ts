import bcrypt from 'bcryptjs';
import { Product, PublicProduct } from '@/types';

// Rate Limiting Memory Map
// Key format: `${ip}:${productId}`
interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Checks and updates rate limiting for password unlock attempts.
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) {
    rateLimitMap.set(identifier, { attempts: 1, firstAttemptAt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  // Reset window if expired
  if (now - entry.firstAttemptAt > WINDOW_MS) {
    rateLimitMap.set(identifier, { attempts: 1, firstAttemptAt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, retryAfterSeconds: 0 };
  }

  // Check if currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  entry.attempts += 1;

  if (entry.attempts > MAX_ATTEMPTS) {
    entry.lockedUntil = now + WINDOW_MS; // Lockout for 10 mins
    rateLimitMap.set(identifier, entry);
    const retryAfter = Math.ceil(WINDOW_MS / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  rateLimitMap.set(identifier, entry);
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.attempts, retryAfterSeconds: 0 };
}

/**
 * Resets rate limit on successful authentication.
 */
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Hashes a plain password server-side with bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies a plain password against bcrypt hash server-side.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error("Password comparison error", err);
    return false;
  }
}

/**
 * Strips sensitive fields (price, description, images, password_hash) for locked items
 * to guarantee no network data leaks before authentication.
 */
export function sanitizeProductForPublic(product: Product): PublicProduct {
  // Never leak password hash under any circumstances
  const { password_hash, ...rest } = product;

  if (product.is_locked) {
    return {
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      category_name: product.category_name,
      is_locked: true,
      in_stock: product.in_stock,
      is_featured: product.is_featured,
      preview_image: product.preview_image || product.images[0] || null,
      // CRITICAL SECURITY: Sensitive fields omitted!
      images: undefined,
      price: undefined,
      price_visible: undefined,
      description: undefined,
    };
  }

  return {
    ...rest,
    images: product.images,
    price: product.price,
    price_visible: product.price_visible,
    description: product.description,
  };
}
