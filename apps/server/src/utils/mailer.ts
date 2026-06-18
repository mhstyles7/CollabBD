import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};
export const sendOTPEmail = async (to: string, otp: string, name: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
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

    const mailOptions = {
      from: `"CollabBD Security" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Verify Your CollabBD Account (OTP)',
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [Real Mode] OTP successfully sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email. Please check your SMTP configuration.');
  }
};
