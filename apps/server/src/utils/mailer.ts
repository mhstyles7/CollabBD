import { Resend } from 'resend';

// Resend client — initialized lazily so we can validate at startup
let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 'your_resend_api_key') {
      throw new Error(
        'RESEND_API_KEY is not configured. Get a free key at https://resend.com/api-keys'
      );
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

/**
 * Validate email configuration at startup.
 * Call this once when the server boots to fail fast if misconfigured.
 */
export const validateEmailConfig = (): void => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || apiKey === 'your_resend_api_key') {
    console.warn('⚠️  RESEND_API_KEY is not configured — OTP emails will NOT be sent.');
    console.warn('   → Get a free API key at: https://resend.com/api-keys');
    console.warn('   → Then add RESEND_API_KEY=re_xxxxx to your .env file');
    return;
  }

  console.log(`✅ Email service configured (from: ${fromEmail || 'onboarding@resend.dev'})`);
};

export const sendOTPEmail = async (to: string, otp: string, name: string): Promise<void> => {
  const client = getResendClient();
  const fromEmail = process.env.EMAIL_FROM || 'CollabBD <onboarding@resend.dev>';

  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8f9fa; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800;">CollabBD</h1>
        <p style="color: #64748b; margin-top: 5px; font-size: 16px;">Bangladesh's Premier Talent Network</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Hello ${name},</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          Thank you for joining CollabBD! To verify your email address and secure your account, please use the following One-Time Password (OTP):
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); padding: 20px; border-radius: 12px; display: inline-block; border: 1px solid #c7d2fe;">
            <span style="font-size: 36px; font-weight: 800; color: #4f46e5; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          This code will expire in <strong>10 minutes</strong>. If you did not request this verification, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 13px;">
        <p>&copy; ${new Date().getFullYear()} CollabBD. All rights reserved.</p>
        <p>Dhaka, Bangladesh</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Verify Your CollabBD Account (OTP)',
      html: htmlTemplate,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(`Resend API error: ${error.message}`);
    }

    console.log(`✅ OTP email sent to ${to} (ID: ${data?.id})`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email. Check RESEND_API_KEY configuration.');
  }
};
