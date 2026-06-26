import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // If SMTP is not fully configured, log the email instead of failing
  const isSmtpConfigured = env.EMAIL_USER && env.EMAIL_PASS;

  if (!isSmtpConfigured) {
    logger.info(`📧 [MOCK EMAIL SENT]
      To: ${options.to}
      Subject: ${options.subject}
      Body: ${options.text}
      HTML-Available: ${!!options.html}
    `);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${options.to}: MessageId: ${info.messageId}`);
  } catch (error) {
    logger.error(`❌ Error sending email to ${options.to}:`, error);
    // In e-commerce, a failed email shouldn't crash the server/transaction, 
    // so we catch the error but let the application flow continue.
  }
};

// Send email verification link
export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Welcome! Please verify your email',
    text: `Hi ${name},\n\nPlease verify your email by clicking on the link below:\n\n${verificationUrl}\n\nThank you!`,
    html: `
      <h2>Hi ${name},</h2>
      <p>Please click the link below to verify your email address and activate your account:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

// Send password reset link
export const sendPasswordResetEmail = async (email: string, name: string, token: string): Promise<void> => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    text: `Hi ${name},\n\nYou requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour.`,
    html: `
      <h2>Hi ${name},</h2>
      <p>You requested a password reset. Please click the button below to set a new password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>This link is valid for 1 hour. If you did not request this, please contact support immediately.</p>
    `,
  });
};
