#!/usr/bin/env node

// Load environment variables
/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');
const path = require('path');

async function sendTestEmail() {
  console.log('\n📧 Sending DevForge Test Email with Animated Logo\n');

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Error: SMTP credentials not set in .env.local');
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

  const testEmail = 'goyalgeetansh@gmail.com';
  
  console.log(`📤 Sending test email to ${testEmail}...`);

  try {
    const info = await transporter.sendMail({
      from: `"DevForge Team" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '🚀 DevForge Update: Hackathon Submissions & Check-in [TEST]',
      attachments: [
        {
          filename: 'logo1.png',
          path: path.join(__dirname, '../../.gemini/antigravity/brain/f8f2da94-194e-4452-9a38-15cbd88297df/devforge_logo_1_1766221828888.png'),
          cid: 'logo1@devforge'
        },
        {
          filename: 'logo2.png',
          path: path.join(__dirname, '../../.gemini/antigravity/brain/f8f2da94-194e-4452-9a38-15cbd88297df/devforge_logo_2_1766221848210.png'),
          cid: 'logo2@devforge'
        }
      ],
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
              padding: 30px 20px; 
              border-radius: 10px; 
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 10px 0 0 0;
              font-size: 24px;
            }
            
            /* Animated Logo Container */
            .logo-container {
              position: relative;
              width: 150px;
              height: 150px;
              margin: 0 auto 20px;
              display: inline-block;
            }
            .logo {
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              animation: rotate-logos 6s infinite;
            }
            .logo:nth-child(2) {
              animation-delay: 3s;
            }
            @keyframes rotate-logos {
              0%, 45% { opacity: 1; }
              50%, 95% { opacity: 0; }
              100% { opacity: 1; }
            }
            
            .content { 
              background: #ffffff; 
              padding: 30px; 
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .content h2 {
              color: #667eea;
              font-size: 20px;
              margin-top: 0;
            }
            .highlight-box {
              background: #f3f4f6;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 15px 0;
            }
            .requirements {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .requirements h3 {
              margin-top: 0;
              color: #f59e0b;
              font-size: 16px;
            }
            .requirements ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
              text-align: center;
            }
            .test-badge {
              background: #ef4444;
              color: white;
              padding: 5px 10px;
              border-radius: 5px;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="test-badge">🧪 TEST EMAIL</div>
            <div class="logo-container">
              <img class="logo" src="cid:logo1@devforge" alt="DevForge Logo 1" />
              <img class="logo" src="cid:logo2@devforge" alt="DevForge Logo 2" />
            </div>
            <h1>🚀 DevForge Update: Hackathon Submissions & Check-in</h1>
          </div>
          
          <div class="content">
            <p>Hi DevForge Participants!</p>
            
            <p>We hope your hackathon journey is going great! 🎉</p>
            
            <p>We wanted to check in and make sure everything is running smoothly. Our organizing team is here to support you, and we want to ensure that you feel comfortable and have everything you need to succeed. If you're facing any challenges or have any concerns, please don't hesitate to reach out to us - we're here to help!</p>
            
            <h2>📝 Important Reminder: Project Submissions</h2>
            
            <p>As you work on your amazing projects, please remember that <strong>all submissions must be made through our official Devpost page</strong>:</p>
            
            <div style="text-align: center;">
              <a href="https://nst-devforge.devpost.com/" class="cta-button">Submit Your Project Here</a>
            </div>
            
            <div class="requirements">
              <h3>Submission Requirements:</h3>
              <ul>
                <li>Join the DevForge hackathon on Devpost (if you haven't already)</li>
                <li>Create your project submission with your team</li>
                <li>Include your project description, demo, and any relevant links</li>
                <li>Submit before the deadline!</li>
              </ul>
            </div>
            
            <p>If you haven't joined the Devpost page yet, please do so as soon as possible. This is where we'll be collecting all submissions and where judging will take place.</p>
            
            <div class="highlight-box">
              <h3>💡 Need Help?</h3>
              <p>If you have any questions about:</p>
              <ul>
                <li>The submission process</li>
                <li>Technical issues</li>
                <li>Hackathon logistics</li>
                <li>Or anything else!</li>
              </ul>
              <p>Feel free to reach out to any of our organizers. We're here to make sure your hackathon experience is fantastic!</p>
            </div>
            
            <p>Keep building, keep innovating, and most importantly - have fun! We can't wait to see what you create. 💡</p>
            
            <p>Best of luck,<br>
            <strong>The DevForge Organizing Team</strong></p>
            
            <div class="footer">
              <p><em>P.S. Remember to take breaks, stay hydrated, and collaborate with your team. The best projects come from well-rested, happy hackers!</em> 😊</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
DevForge Update: Hackathon Submissions & Check-in 🚀

[TEST EMAIL]

Hi DevForge Participants!

We hope your hackathon journey is going great! 🎉

We wanted to check in and make sure everything is running smoothly. Our organizing team is here to support you, and we want to ensure that you feel comfortable and have everything you need to succeed. If you're facing any challenges or have any concerns, please don't hesitate to reach out to us - we're here to help!

📝 Important Reminder: Project Submissions

As you work on your amazing projects, please remember that all submissions must be made through our official Devpost page:

🔗 Submit Your Project Here: https://nst-devforge.devpost.com/

Submission Requirements:
- Join the DevForge hackathon on Devpost (if you haven't already)
- Create your project submission with your team
- Include your project description, demo, and any relevant links
- Submit before the deadline!

If you haven't joined the Devpost page yet, please do so as soon as possible. This is where we'll be collecting all submissions and where judging will take place.

💡 Need Help?

If you have any questions about:
- The submission process
- Technical issues
- Hackathon logistics
- Or anything else!

Feel free to reach out to any of our organizers. We're here to make sure your hackathon experience is fantastic!

Keep building, keep innovating, and most importantly - have fun! We can't wait to see what you create. 💡

Best of luck,
The DevForge Organizing Team

P.S. Remember to take breaks, stay hydrated, and collaborate with your team. The best projects come from well-rested, happy hackers! 😊
      `,
    });

    console.log(`   ✅ Test email sent successfully!`);
    console.log(`   📧 Message ID: ${info.messageId}`);
    console.log(`\n✨ Check your inbox at ${testEmail} to see the animated logo!\n`);
  } catch (error) {
    console.error(`   ❌ Failed to send: ${error.message}`);
    process.exit(1);
  }
}

sendTestEmail();
