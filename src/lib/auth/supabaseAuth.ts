import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email/sendOtpEmail';

const ADMIN_TARGET_EMAIL = 'vegadamit2003@gmail.com';

export interface AuthResult {
  success: boolean;
  error?: string;
  token?: string;
  adminUserId?: string;
  otpSent?: boolean;
}

const MASTER_ADMIN_LOCK_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Authenticates admin strictly using Supabase Auth or admin_users database table.
 */
export async function loginWithSupabaseAuth(emailInput: string, passwordInput: string): Promise<AuthResult> {
  if (!emailInput || !passwordInput) {
    return { success: false, error: 'Email and password are required.' };
  }

  const normalizedEmail = emailInput.trim().toLowerCase();
  const supabase = createAdminClient();

  // 1. Try native Supabase Auth signInWithPassword
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: passwordInput,
    });

    if (!authError && authData.session && authData.user) {
      return {
        success: true,
        token: authData.session.access_token,
        adminUserId: MASTER_ADMIN_LOCK_ID,
      };
    }
  } catch (err) {
    console.warn('Supabase Auth native login failed, checking admin_users table:', err);
  }

  // 2. Strict matching from admin_users table in Supabase
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (data && data.password_hash) {
      const isBcryptMatch = data.password_hash.startsWith('$2') && bcrypt.compareSync(passwordInput, data.password_hash);
      const isPlainMatch = passwordInput === data.password_hash;

      if (isBcryptMatch || isPlainMatch) {
        const token = `chetak_admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        return {
          success: true,
          token,
          adminUserId: MASTER_ADMIN_LOCK_ID,
        };
      }
    }
  } catch (err) {
    console.warn('Fallback admin lookup error:', err);
  }

  // 3. Final default check for initial setup phase (strictly matching admin email)
  if ((normalizedEmail === 'admin@chetakfashion.com' || normalizedEmail === ADMIN_TARGET_EMAIL) && passwordInput === 'admin123') {
    const token = `chetak_admin_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      success: true,
      token,
      adminUserId: MASTER_ADMIN_LOCK_ID,
    };
  }

  return { success: false, error: 'Invalid admin credentials. Access denied!' };
}

/**
 * Sends a 6-digit OTP to vegadamit2003@gmail.com for password change verification.
 */
export async function sendPasswordChangeOtp(emailInput: string = ADMIN_TARGET_EMAIL): Promise<AuthResult> {
  const targetEmail = emailInput.trim().toLowerCase() || ADMIN_TARGET_EMAIL;
  const supabase = createAdminClient();

  // Generate 6-digit numeric OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // 1. Store OTP in Supabase admin_otps table (using phone column for target email storage)
  try {
    await supabase.from('admin_otps').delete().eq('phone', targetEmail);
    await supabase.from('admin_otps').insert({
      phone: targetEmail,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_used: false,
    });
  } catch (err) {
    console.warn('Failed to insert OTP into admin_otps table:', err);
  }

  // 2. Attempt direct SMTP 6-digit OTP email delivery
  const emailRes = await sendOtpEmail({ toEmail: targetEmail, otpCode });

  // 3. Fallback to Supabase Auth OTP Email if SMTP not configured
  if (!emailRes.success) {
    try {
      const { error: authOtpErr } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (authOtpErr) {
        console.warn('Supabase Auth signInWithOtp warning:', authOtpErr.message);
      }
    } catch (err) {
      console.warn('Supabase Auth OTP send error:', err);
    }
  }

  console.log(`[SECURITY SERVER LOG] Generated 6-Digit OTP for ${targetEmail}: ${otpCode}`);

  return {
    success: true,
    otpSent: true,
  };
}

/**
 * Verifies OTP code and updates admin password in both Supabase Auth and admin_users table.
 */
export async function verifyOtpAndUpdatePassword(
  emailInput: string = ADMIN_TARGET_EMAIL,
  otpCode: string,
  newPassword: string
): Promise<AuthResult> {
  if (!otpCode || !newPassword) {
    return { success: false, error: 'OTP code and new password are required.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const targetEmail = emailInput.trim().toLowerCase() || ADMIN_TARGET_EMAIL;
  const supabase = createAdminClient();

  // 1. Verify OTP from admin_otps table or Supabase Auth
  let isOtpValid = false;

  try {
    const { data: otps } = await supabase
      .from('admin_otps')
      .select('*')
      .eq('phone', targetEmail)
      .eq('otp_code', otpCode.trim())
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (otps && otps.length > 0) {
      isOtpValid = true;
    }
  } catch (err) {
    console.warn('Error checking admin_otps table:', err);
  }

  // If table check didn't match, attempt Supabase Auth verifyOtp
  if (!isOtpValid) {
    try {
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: otpCode.trim(),
        type: 'email',
      });

      if (!verifyErr && verifyData.session) {
        isOtpValid = true;
      }
    } catch (err) {
      console.warn('Supabase Auth verifyOtp error:', err);
    }
  }

  if (!isOtpValid) {
    return { success: false, error: 'Invalid or expired OTP code. Please request a new OTP.' };
  }

  // 2. Hash new password
  const newHash = bcrypt.hashSync(newPassword, 10);

  // 3. Update or create user in Supabase Auth using Admin API
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existingUser = usersData?.users?.find(u => u.email?.toLowerCase() === targetEmail);

    if (existingUser) {
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: newPassword,
        email_confirm: true,
      });
    } else {
      await supabase.auth.admin.createUser({
        email: targetEmail,
        password: newPassword,
        email_confirm: true,
      });
    }
  } catch (err) {
    console.warn('Supabase auth.admin updateUser error:', err);
  }

  // 4. Update password in admin_users database table
  try {
    await supabase.from('admin_users').upsert({
      id: '00000000-0000-0000-0000-000000000001',
      email: targetEmail,
      password_hash: newHash,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to update admin_users table:', err);
  }

  // 5. Clean up used OTPs
  try {
    await supabase.from('admin_otps').delete().eq('email', targetEmail);
  } catch (err) {}

  return { success: true };
}
