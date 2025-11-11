#!/usr/bin/env node

/**
 * Script to update a user to have admin powers and mentor role
 * Usage: node update-mentor.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with individual environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase credentials in environment variables');
  console.log('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

// Replace escaped newlines with actual newlines
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

const MENTOR_USER_ID = 'user-1762867739450-of8jjhud0';

async function updateUserToMentor() {
  try {
    console.log('🔄 Starting mentor update process...\n');
    
    // Get the member document
    const memberRef = db.collection('members').doc(MENTOR_USER_ID);
    const memberDoc = await memberRef.get();
    
    if (!memberDoc.exists) {
      console.error(`❌ Member with ID ${MENTOR_USER_ID} not found!`);
      console.log('\n💡 Please verify the user ID is correct.');
      process.exit(1);
    }
    
    const memberData = memberDoc.data();
    console.log('📋 Current member data:');
    console.log(`   Name: ${memberData.name}`);
    console.log(`   Username: ${memberData.username}`);
    console.log(`   Email: ${memberData.email}`);
    console.log(`   Current Role: ${memberData.role || 'member'}`);
    console.log('');
    
    // Update member to admin and ensure mentor designation
    await memberRef.update({
      role: 'admin',
      designation: 'Mentor',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Member updated successfully!');
    console.log('');
    console.log('📝 New permissions:');
    console.log('   ✓ Role: admin');
    console.log('   ✓ Designation: Mentor');
    console.log('   ✓ Can access /admin routes');
    console.log('   ✓ Can approve/reject members');
    console.log('   ✓ Can manage all projects');
    console.log('   ✓ Can send credentials');
    console.log('   ✓ Full administrative access');
    console.log('');
    
    // Verify the update
    const updatedDoc = await memberRef.get();
    const updatedData = updatedDoc.data();
    console.log('🔍 Verified updated data:');
    console.log(`   Role: ${updatedData.role}`);
    console.log(`   Designation: ${updatedData.designation}`);
    console.log('');
    console.log('🎉 Mentor setup complete!');
    
  } catch (error) {
    console.error('❌ Error updating member:', error);
    process.exit(1);
  }
}

// Run the update
updateUserToMentor()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
