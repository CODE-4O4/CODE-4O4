#!/usr/bin/env node

/**
 * Script to send rejection emails to non-selected hackathon participants
 * Informs them that selection is complete and invites them to view presentations at 6 PM
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// List of selected participants (50 students who were accepted)
const SELECTED_EMAILS = [
    'atul.sahu025@gmail.com',
    'rathoddhiraj310@gmail.com',
    'rajsamriddhi60@gmail.com',
    'layshah0737@gmail.com',
    'mahaveerjain1098765@gmail.com',
    'aryanpatel4306@gmail.com',
    'kartikmanmode12@gmail.com',
    'dhanishtha706@gmail.com',
    'kumariannubhav@gmail.com',
    '2102508762@svyasa-sas.edu.in',
    'vineeshss005@gmail.com',
    '2102508756@svyasa-sas.edu.in',
    'jaidevbasandrai@gmail.com',
    'Saurabhyuvi14@gmail.com',
    'chsaisrija2007@gmail.com',
    'nishthaagarwal937@gmail.com',
    'buriburizaemon2911@gmail.com',
    'sainuverma12@gmail.com',
    '2102508813@svyasa-sas.edu.in',
    'rachana.ady@gmail.com',
    'anushkagupta6155@gmai.com',
    '2102508716@svyasa-sas.edu.in',
    '2102508804@svyasa-sas.edu.in',
    '2102508811@svyasa-sas.edu.in',
    '2102508718@svyasa-sas.edu.in',
    '2122508901@svyasa-sas.edu.in',
    'pavithra210906@gmail.com',
    'dhanushrigp@gmail.com',
    'meghamadhurya123@gmail.com',
    'mallemputipujitha2007@gmail.com',
    'lekha.maruthi2007@gmail.com',
    'ashhhuthhy@gmail.com',
    'bhavishyap1406@gmail.com',
    'sakshisrinivaspeddarpeth@gmail.com',
    'zaibakhanzaiba9@gmail.com',
    'aishwanth.dev@gmail.com',
    'govind.dhondale@gmail.com',
    'aprameya9844@gmail.com',
    'Vishwajeeth.rao.2021@gmail.com',
    'rudreshrashi@gmail.com',
    'pavithraa536@gmail.com',
    'poornachandrag98@gmail.com',
    'knoxsharma9741@gmail.com',
    'Prateekpoddar6106@gmail.com',
    'himanshusonawne2006@gmail.com',
    'varnikashri007@gmail.com',
    'tharaksreeram@gmail.com',
    'nandithamelmalgi@gmail.com',
    'megs200717@gmail.com',
    'meesachoshantt@gmail.com',
].map(email => email.toLowerCase());

// Create email transporter
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

// Generate rejection email HTML
function generateRejectionEmail(name) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevForge Hackathon Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #171717; border-radius: 16px; overflow: hidden; border: 1px solid #333;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px; text-align: center;">
                            <h1 style="color: #000000; margin: 0; font-size: 32px; font-weight: bold;">DevForge</h1>
                            <p style="color: #000000; margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Hackathon Selection Update</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px;">Hi ${name},</h2>
                            
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for your interest in <strong style="color: #f97316;">DevForge Hackathon</strong>! We truly appreciate your enthusiasm and the effort you put into your registration.
                            </p>
                            
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                After careful consideration of all applications, we have completed our selection process. We received an overwhelming response and have selected <strong style="color: #ffffff;">50 participants</strong> whose attendance has been confirmed for the hackathon.
                            </p>
                            
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Unfortunately, we were unable to include you in this cohort due to limited slots. We sincerely apologize for not being able to accept your application this time.
                            </p>
                            
                            <!-- Invitation Box -->
                            <div style="background-color: #1f1f1f; border: 1px solid #f97316; border-radius: 12px; padding: 24px; margin: 30px 0;">
                                <h3 style="color: #f97316; margin: 0 0 12px 0; font-size: 18px;">🎉 You're Still Invited!</h3>
                                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                                    We'd love for you to join us at <strong style="color: #f97316;">6:00 PM sharp</strong> to watch the final project presentations and demos by our participants. It's a great opportunity to see amazing projects and connect with the community!
                                </p>
                            </div>
                            
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We hope to see you there, and we encourage you to apply for future events. Your passion for development is what makes our community thrive!
                            </p>
                            
                            <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                                Best regards,<br>
                                <strong style="color: #ffffff;">The DevForge Team</strong><br>
                                <span style="color: #737373; font-size: 14px;">Dev Club NSTxSVYASA</span>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #333;">
                            <p style="color: #525252; font-size: 12px; margin: 0;">
                                © 2025 DevForge. Built by Dev Club NSTxSVYASA.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

async function sendRejectionEmails() {
    console.log('📧 DevForge Rejection Email Script\n');

    if (isDryRun) {
        console.log('🔍 DRY RUN MODE - No emails will be sent\n');
    } else {
        console.log('⚠️  LIVE MODE - Emails will be sent\n');
    }

    // Check environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Error: SMTP credentials not configured');
        console.error('Please ensure .env.local has SMTP_HOST, SMTP_USER, and SMTP_PASS');
        process.exit(1);
    }

    // Initialize Firebase Admin
    try {
        if (!admin.apps.length) {
            if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
                console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT not configured');
                process.exit(1);
            }

            const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
            const parsed = JSON.parse(serviceAccountJson);

            let privateKey = parsed.private_key;
            if (typeof privateKey === 'string') {
                privateKey = privateKey.replace(/\\n/g, '\n');
            }

            const serviceAccount = {
                projectId: parsed.project_id,
                clientEmail: parsed.client_email,
                privateKey: privateKey,
            };

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('✅ Firebase Admin initialized\n');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error.message);
        process.exit(1);
    }

    const db = admin.firestore();
    const transporter = createTransporter();

    try {
        // Fetch all hackathon registrations
        console.log('📥 Fetching all hackathon registrations...');
        const registrationsSnapshot = await db.collection('hackathon_registrations').get();

        if (registrationsSnapshot.empty) {
            console.log('⚠️  No registrations found in database');
            return;
        }

        // Get all participants and filter out selected ones
        const allParticipants = [];
        registrationsSnapshot.forEach(doc => {
            const data = doc.data();
            const members = Array.isArray(data.members) ? data.members : [];
            
            // Add all members (not just lead) to get everyone's email
            members.forEach(member => {
                if (member.email) {
                    allParticipants.push({
                        email: member.email.toLowerCase(),
                        name: member.name || 'Participant',
                    });
                }
            });
        });

        console.log(`📊 Total participants in database: ${allParticipants.length}`);
        console.log(`✅ Selected participants (excluded): ${SELECTED_EMAILS.length}\n`);

        // Filter out selected participants
        const rejectedParticipants = allParticipants.filter(
            p => !SELECTED_EMAILS.includes(p.email.toLowerCase())
        );

        // Remove duplicates by email
        const uniqueRejected = [];
        const seenEmails = new Set();
        for (const p of rejectedParticipants) {
            if (!seenEmails.has(p.email)) {
                seenEmails.add(p.email);
                uniqueRejected.push(p);
            }
        }

        console.log(`📧 Rejection emails to send: ${uniqueRejected.length}\n`);

        if (isDryRun) {
            console.log('📋 Participants who would receive rejection emails:');
            uniqueRejected.forEach((p, index) => {
                console.log(`   ${index + 1}. ${p.name} (${p.email})`);
            });
            console.log('\n✅ Dry run complete. Run without --dry-run to send emails.');
            return;
        }

        // Send emails
        console.log('📤 Sending rejection emails...\n');
        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };

        for (let i = 0; i < uniqueRejected.length; i++) {
            const participant = uniqueRejected[i];
            const progress = `[${i + 1}/${uniqueRejected.length}]`;

            console.log(`${progress} Sending to ${participant.name} (${participant.email})...`);

            try {
                const info = await transporter.sendMail({
                    from: `"DevForge" <${process.env.SMTP_USER}>`,
                    to: participant.email,
                    subject: 'DevForge Hackathon - Selection Update',
                    html: generateRejectionEmail(participant.name),
                });

                console.log(`   ✅ Sent successfully (Message ID: ${info.messageId})`);
                results.success++;
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                results.failed++;
                results.errors.push({
                    participant: participant.email,
                    error: error.message,
                });
            }

            // Rate limiting: wait 1 second between emails
            if (i < uniqueRejected.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total rejection emails: ${uniqueRejected.length}`);
        console.log(`✅ Successfully sent: ${results.success}`);
        console.log(`❌ Failed: ${results.failed}`);

        if (results.errors.length > 0) {
            console.log('\n❌ Errors:');
            results.errors.forEach(err => {
                console.log(`   - ${err.participant}: ${err.error}`);
            });
        }

        console.log('\n✅ Rejection email process complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the script
sendRejectionEmails().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
