#!/usr/bin/env node

/**
 * Script to list all users to find the correct user ID
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase credentials');
  process.exit(1);
}

const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: projectId,
    clientEmail: clientEmail,
    privateKey: formattedPrivateKey,
  }),
  projectId: projectId,
});

const db = admin.firestore();

async function listUsers() {
  try {
    console.log('📋 Fetching all members...\n');
    
    const membersSnapshot = await db.collection('members').get();
    
    if (membersSnapshot.empty) {
      console.log('No members found in database');
      return;
    }
    
    console.log(`Found ${membersSnapshot.size} members:\n`);
    console.log('═'.repeat(100));
    
    membersSnapshot.forEach((doc) => {
      const member = doc.data();
      console.log(`\nMember ID: ${doc.id}`);
      console.log(`  Name: ${member.name || 'N/A'}`);
      console.log(`  Username: ${member.username || 'N/A'}`);
      console.log(`  Email: ${member.email || 'N/A'}`);
      console.log(`  Role: ${member.role || 'member'}`);
      console.log(`  Status: ${member.status || 'N/A'}`);
      if (member.designation) console.log(`  Designation: ${member.designation}`);
      console.log('─'.repeat(100));
    });
    
    console.log('\n✅ Member list complete');
    
  } catch (error) {
    console.error('❌ Error fetching members:', error);
    process.exit(1);
  }
}

listUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
