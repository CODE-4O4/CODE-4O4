#!/usr/bin/env node

// Load environment variables
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendFeedbackEmails() {
  console.log('\n📧 Sending DevForge Feedback & Results Email to All Participants\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP credentials not set in .env.local');
    process.exit(1);
  }

  // Read email list
  const emailListPath = path.join(__dirname, 'email.txt');
  const emailList = fs.readFileSync(emailListPath, 'utf-8')
    .split('\n')
    .map(email => email.trim())
    .filter(email => email.length > 0);

  console.log(`📋 Found ${emailList.length} participants\n`);

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

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < emailList.length; i++) {
    const email = emailList[i];
    console.log(`📤 Sending to ${email} (${i + 1}/${emailList.length})...`);

    try {
      const info = await transporter.sendMail({
        from: `"DevForge Team" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎉 DevForge Hackathon Results & Feedback Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                line-height: 1.6; 
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9fafb;
              }
              .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 40px 30px; 
                border-radius: 12px; 
                text-align: center;
                margin-bottom: 30px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
              }
              .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 700;
              }
              .header .subtitle {
                font-size: 16px;
                opacity: 0.95;
                margin: 0;
              }
              
              .content { 
                background: #ffffff; 
                padding: 35px; 
                border-radius: 12px;
                box-shadow: 0 2px 15px rgba(0,0,0,0.08);
              }
              .content h2 {
                color: #667eea;
                font-size: 22px;
                margin-top: 0;
                margin-bottom: 15px;
              }
              .winner-box {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                border: 3px solid #f59e0b;
                padding: 25px;
                margin: 25px 0;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
              }
              .winner-box h3 {
                margin: 0 0 10px 0;
                font-size: 24px;
                color: #92400e;
              }
              .winner-box .trophy {
                font-size: 48px;
                margin-bottom: 10px;
              }
              .winner-box .team-name {
                font-size: 32px;
                font-weight: bold;
                color: #1f2937;
                margin: 15px 0;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .highlight-box {
                background: #ede9fe;
                border-left: 5px solid #667eea;
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
              }
              .highlight-box h3 {
                margin-top: 0;
                color: #5b21b6;
                font-size: 18px;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white !important;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                transition: transform 0.2s;
              }
              .cta-button:hover {
                transform: translateY(-2px);
              }
              .info-box {
                background: #fef3c7;
                border-left: 5px solid #f59e0b;
                padding: 20px;
                margin: 25px 0;
                border-radius: 8px;
              }
              .info-box h3 {
                margin-top: 0;
                color: #92400e;
                font-size: 18px;
              }
              .info-box ul {
                margin: 10px 0;
                padding-left: 20px;
              }
              .info-box li {
                margin: 8px 0;
              }
              .footer {
                margin-top: 35px;
                padding-top: 25px;
                border-top: 2px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
                text-align: center;
              }
              .emoji-large {
                font-size: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 DevForge Hackathon Results!</h1>
              <p class="subtitle">Thank You for an Amazing Event</p>
            </div>
            
            <div class="content">
              <p>Dear DevForge Participants,</p>
              
              <p>We hope you enjoyed every moment of the DevForge Hackathon! <span class="emoji-large">🚀</span></p>
              
              <p>It was incredible to witness the creativity, innovation, and teamwork you all brought to the event. Your projects truly showcased the amazing talent in our community!</p>
              
              <div class="winner-box">
                <div class="trophy">🏆</div>
                <h3>Winner Announcement</h3>
                <p>After careful deliberation, all our judges have finalized their decision.</p>
                <p>The winner of DevForge Hackathon is:</p>
                <div class="team-name">Team Zypher</div>
                <p style="margin-top: 15px; font-size: 16px;">🎊 Congratulations! 🎊</p>
              </div>
              
              <h2>📝 We Need Your Feedback!</h2>
              
              <p>Your feedback is invaluable to us! Please take a few minutes to share your thoughts about the hackathon. Your insights will help us make future events even better.</p>
              
              <div style="text-align: center;">
                <a href="https://devforge.fillout.com/feedback" class="cta-button">Share Your Feedback</a>
              </div>
              
              <div class="info-box">
                <h3>📅 Prize & Certificate Distribution</h3>
                <ul>
                  <li><strong>Date:</strong> Monday</li>
                  <li><strong>Time:</strong> Will be shared soon</li>
                  <li><strong>What to expect:</strong> Prize distribution and certificate handover ceremony</li>
                </ul>
                <p style="margin-bottom: 0;"><em>We'll send you the exact timing details very shortly. Stay tuned!</em></p>
              </div>
              
              <div class="highlight-box">
                <h3>💜 Thank You!</h3>
                <p>A huge thank you to all participants for your enthusiasm, hard work, and dedication. Whether you won or not, each project was impressive and contributed to making this event a success.</p>
                <p style="margin-bottom: 0;">We look forward to seeing you at future DevForge events!</p>
              </div>
              
              <p>Keep innovating, keep building! <span class="emoji-large">💡✨</span></p>
              
              <p>Best regards,<br>
              <strong>The DevForge Organizing Team</strong></p>
              
              <div class="footer">
                <p><em>P.S. Don't forget to share your feedback - it only takes a few minutes and means the world to us!</em> 😊</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
DevForge Hackathon Results! 🎉

Dear DevForge Participants,

We hope you enjoyed every moment of the DevForge Hackathon! 🚀

It was incredible to witness the creativity, innovation, and teamwork you all brought to the event. Your projects truly showcased the amazing talent in our community!

🏆 WINNER ANNOUNCEMENT 🏆

After careful deliberation, all our judges have finalized their decision.

The winner of DevForge Hackathon is:
>>> TEAM ZYPHER <<<

🎊 Congratulations! 🎊

📝 WE NEED YOUR FEEDBACK!

Your feedback is invaluable to us! Please take a few minutes to share your thoughts about the hackathon. Your insights will help us make future events even better.

🔗 Share Your Feedback: https://devforge.fillout.com/feedback

📅 PRIZE & CERTIFICATE DISTRIBUTION

- Date: Monday
- Time: Will be shared soon
- What to expect: Prize distribution and certificate handover ceremony

We'll send you the exact timing details very shortly. Stay tuned!

💜 THANK YOU!

A huge thank you to all participants for your enthusiasm, hard work, and dedication. Whether you won or not, each project was impressive and contributed to making this event a success.

We look forward to seeing you at future DevForge events!

Keep innovating, keep building! 💡✨

Best regards,
The DevForge Organizing Team

P.S. Don't forget to share your feedback - it only takes a few minutes and means the world to us! 😊
        `,
      });

      successCount++;
      console.log(`   ✅ Sent! (Message ID: ${info.messageId})`);
      
      // Wait 1 second between emails to avoid rate limiting
      if (i < emailList.length - 1) {
        await sleep(1000);
      }
    } catch (error) {
      failCount++;
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary: ${successCount} sent, ${failCount} failed`);
  console.log('='.repeat(50) + '\n');
}

sendFeedbackEmails();
