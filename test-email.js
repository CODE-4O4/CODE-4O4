#!/usr/bin/env node

// Load environment variables
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

async function sendTestEmail() {
  console.log('\n🧪 Testing Email Configuration\n');
  console.log('📧 SMTP Settings:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
  console.log('');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP credentials not set in .env.local');
    console.log('\nPlease add these to your .env.local file:');
    console.log('SMTP_HOST=smtp.purelymail.com');
    console.log('SMTP_PORT=465');
    console.log('SMTP_USER=your-email@domain.com');
    console.log('SMTP_PASS=your-password');
    process.exit(1);
  }

  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log('📤 Sending test email to goyalgeetansh@gmail.com...\n');

  try {
    const info = await transporter.sendMail({
      from: `"DevForge" <${process.env.SMTP_USER}>`,
      to: 'goyalgeetansh@gmail.com',
      subject: '🧪 Test Email - DevForge',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 10px; }
            .success { color: #10b981; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Email System Test</h1>
          </div>
          <div class="content">
            <h2>Hello Geetansh! 👋</h2>
            <p class="success">Your email system is working perfectly!</p>
            <p>This is a test email from the DevForge credential system.</p>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>SMTP Server: ${process.env.SMTP_HOST}</li>
              <li>Port: ${port} (${secure ? 'SSL/TLS' : 'STARTTLS'})</li>
              <li>Sent at: ${new Date().toLocaleString()}</li>
            </ul>
            <p>You're all set to send member credentials! 🚀</p>
          </div>
        </body>
        </html>
      `,
      text: `
✅ Email System Test

Hello Geetansh!

Your email system is working perfectly!

This is a test email from the DevForge credential system.

Configuration Details:
- SMTP Server: ${process.env.SMTP_HOST}
- Port: ${port} (${secure ? 'SSL/TLS' : 'STARTTLS'})
- Sent at: ${new Date().toLocaleString()}

You're all set to send member credentials! 🚀
      `,
    });

    console.log('✅ Success! Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log('\n📬 Check goyalgeetansh@gmail.com inbox (and spam folder)');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to send email:\n');
    console.error(error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Verify SMTP credentials are correct in .env.local');
    console.log('   2. Check that your email provider allows SMTP access');
    console.log('   3. Ensure port 465 is not blocked by firewall');
    console.log('   4. Try using port 587 with STARTTLS instead');
    process.exit(1);
  }
}

sendTestEmail();
