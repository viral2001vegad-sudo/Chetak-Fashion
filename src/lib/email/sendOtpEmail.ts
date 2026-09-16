import nodemailer from 'nodemailer';

interface SendOtpOptions {
  toEmail: string;
  otpCode: string;
}

/**
 * Sends a clean 6-Digit OTP verification email to the recipient using Nodemailer.
 */
export async function sendOtpEmail({ toEmail, otpCode }: SendOtpOptions): Promise<{ success: boolean; error?: string }> {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    console.warn('[EMAIL WARNING] SMTP_USER or SMTP_PASS not set in .env.local.');
    return {
      success: false,
      error: 'SMTP email credentials not configured in .env.local.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #b45309; margin: 0;">CHETAK FASHION ADMIN</h2>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Security Verification Code</p>
        </div>
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <p style="font-size: 14px; color: #92400e; font-weight: bold; margin-top: 0;">Your 6-Digit Admin Verification OTP:</p>
          <h1 style="font-size: 36px; letter-spacing: 8px; color: #b45309; margin: 10px 0; font-family: monospace;">${otpCode}</h1>
          <p style="font-size: 12px; color: #78350f; margin-bottom: 0;">This code is valid for 10 minutes. Do not share it with anyone.</p>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
          Requested for admin account vegadamit2003@gmail.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Chetak Fashion Admin" <${smtpUser}>`,
      to: toEmail,
      subject: `Your Admin Verification OTP Code: ${otpCode}`,
      html: htmlContent,
    });

    console.log(`[EMAIL SUCCESS] OTP email delivered to ${toEmail} via SMTP.`);
    return { success: true };
  } catch (err: any) {
    console.error('[EMAIL ERROR] Failed to send OTP email via SMTP:', err);
    return { success: false, error: err.message || 'SMTP sending failed.' };
  }
}
