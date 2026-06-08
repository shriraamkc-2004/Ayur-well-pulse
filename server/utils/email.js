const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Use SMTP if credentials are configured, otherwise fall back to no-op
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    logger.info('Email transporter configured via SMTP');
    return transporter;
  }

  logger.warn('SMTP not configured — emails will be logged instead of sent');
  return null;
}

const FROM_ADDRESS = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@ayurwell.com';
const FROM_NAME = 'AyurWell Pulse';

// Send welcome email on signup
async function sendWelcomeEmail(toEmail, fullName) {
  const t = getTransporter();
  if (!t) {
    logger.info(`[Email] Would send welcome email to: ${toEmail}`);
    return;
  }

  const subject = 'Welcome to AyurWell Pulse!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to AyurWell Pulse!</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>${fullName || 'there'}</strong>,</p>
        <p>Your account has been created successfully! AyurWell Pulse is your companion for Ayurvedic wellness, diet planning, and holistic health management.</p>
        <h3 style="color: #16a34a;">What you can do:</h3>
        <ul>
          <li>Log your meals and track your dosha balance</li>
          <li>Get personalized Ayurvedic diet plans</li>
          <li>Connect with verified Ayurvedic practitioners</li>
          <li>Chat with healthcare professionals in real-time</li>
        </ul>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://ayur-well-pulse.vercel.app'}" style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Get Started
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">This email was sent by AyurWell Pulse. If you did not create this account, please ignore this email.</p>
      </div>
    </div>
  `;

  await t.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to: toEmail,
    subject,
    html,
  });

  logger.info(`Welcome email sent to: ${toEmail}`);
}

// Send login notification email
async function sendLoginNotificationEmail(toEmail, fullName, ipAddress) {
  const t = getTransporter();
  if (!t) {
    logger.info(`[Email] Would send login notification to: ${toEmail}`);
    return;
  }

  const subject = 'New Login to Your AyurWell Account';
  const loginTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Login Notification</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>${fullName || 'there'}</strong>,</p>
        <p>We noticed a new login to your AyurWell Pulse account.</p>
        <div style="background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Time:</strong> ${loginTime} (IST)</p>
          ${ipAddress ? `<p style="margin: 5px 0;"><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
        </div>
        <p>If this was you, no action is needed. If you don't recognize this login, please change your password immediately.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">This email was sent by AyurWell Pulse. If you have questions, contact support.</p>
      </div>
    </div>
  `;

  await t.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to: toEmail,
    subject,
    html,
  });

  logger.info(`Login notification email sent to: ${toEmail}`);
}

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
};
