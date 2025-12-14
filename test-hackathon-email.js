#!/usr/bin/env node

/**
 * Test script to send a hackathon confirmation email
 * This verifies that the email system is working correctly
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

async function testHackathonEmail() {
    console.log('🧪 Testing Hackathon Email System...\n');

    // Check environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Error: SMTP credentials not configured');
        console.error('Please ensure .env.local has SMTP_HOST, SMTP_USER, and SMTP_PASS');
        process.exit(1);
    }

    console.log('✅ SMTP credentials found');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   User: ${process.env.SMTP_USER}\n`);

    // Import the email function
    const { sendHackathonRegistrationEmail } = require('./src/lib/email.ts');

    // Test data
    const testData = {
        to: process.env.SMTP_USER, // Send to yourself for testing
        name: 'Test User',
        type: 'team',
        teamName: 'Test Team',
        memberCount: 3,
    };

    console.log('📧 Sending test email...');
    console.log(`   To: ${testData.to}`);
    console.log(`   Name: ${testData.name}`);
    console.log(`   Type: ${testData.type}`);
    console.log(`   Team: ${testData.teamName}`);
    console.log(`   Members: ${testData.memberCount}\n`);

    try {
        const result = await sendHackathonRegistrationEmail(testData);

        if (result.success) {
            console.log('✅ Test email sent successfully!');
            console.log(`   Message ID: ${result.messageId}`);
            console.log('\n📬 Please check your inbox to verify:');
            console.log('   1. Email shows "20 SLOTS Left" (not 50 spots)');
            console.log('   2. MLH selection process is clearly mentioned');
            console.log('   3. Warning box states registration is NOT final');
            console.log('   4. Email formatting looks correct');
        } else {
            console.error('❌ Failed to send test email');
            console.error(`   Error: ${result.error}`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error sending test email:', error);
        process.exit(1);
    }
}

// Run the test
testHackathonEmail().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
