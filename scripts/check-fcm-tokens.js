#!/usr/bin/env node

/**
 * Check FCM tokens in the database
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");

// Check environment variables first
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT environment variable not set");
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
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
    console.log("✅ Firebase Admin initialized\n");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function checkTokens() {
  try {
    console.log("🔍 Checking fcmTokens collection...\n");
    
    const fcmSnapshot = await db.collection("fcmTokens").get();
    
    if (fcmSnapshot.empty) {
      console.log("❌ No tokens found in fcmTokens collection");
    } else {
      console.log(`✅ Found ${fcmSnapshot.size} token(s) in fcmTokens collection:`);
      fcmSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\n  Document ID: ${doc.id}`);
        console.log(`  User ID: ${data.userId}`);
        console.log(`  Token: ${data.token?.substring(0, 20)}...`);
        console.log(`  Created: ${data.createdAt?.toDate?.() || 'N/A'}`);
      });
    }
    
    console.log("\n" + "=".repeat(60) + "\n");
    console.log("🔍 Checking members collection for FCM tokens...\n");
    
    const membersSnapshot = await db.collection("members").get();
    
    if (membersSnapshot.empty) {
      console.log("❌ No members found");
    } else {
      console.log(`✅ Found ${membersSnapshot.size} member(s):`);
      let membersWithTokens = 0;
      
      membersSnapshot.forEach((doc) => {
        const data = doc.data();
        const hasToken = !!(data.fcmToken || data.fcmTokens);
        
        console.log(`\n  ID: ${doc.id}`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Email: ${data.email}`);
        console.log(`  Has FCM Token: ${hasToken ? '✅' : '❌'}`);
        
        if (hasToken) {
          membersWithTokens++;
          if (data.fcmToken) {
            console.log(`  FCM Token: ${data.fcmToken.substring(0, 20)}...`);
          }
          if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
            console.log(`  FCM Tokens Array: ${data.fcmTokens.length} token(s)`);
          }
        }
      });
      
      console.log(`\n📊 Summary: ${membersWithTokens}/${membersSnapshot.size} members have FCM tokens`);
    }
    
  } catch (error) {
    console.error("❌ Error checking tokens:", error);
    process.exit(1);
  }
}

checkTokens()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
