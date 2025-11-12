#!/usr/bin/env node

/**
 * Send a test notification to a specific user
 * Usage: node scripts/send-test-notification.js <userId>
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");

// Check environment variables first
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT environment variable not set");
  console.log("💡 Make sure your .env.local file exists and contains FIREBASE_SERVICE_ACCOUNT");
  process.exit(1);
}

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    const parsed = JSON.parse(serviceAccountJson);
    
    // CRITICAL: Handle newline encodings in private key
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
    console.log("✅ Firebase Admin initialized");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    console.log("💡 Check that FIREBASE_SERVICE_ACCOUNT is valid JSON");
    process.exit(1);
  }
}

const db = admin.firestore();

async function sendTestNotification(userId) {
  try {
    console.log(`🔔 Sending test notification to user: ${userId}`);

    // Get user's FCM tokens
    const tokensSnapshot = await db
      .collection("fcmTokens")
      .where("userId", "==", userId)
      .get();

    if (tokensSnapshot.empty) {
      console.log("❌ No FCM tokens found for this user");
      console.log("💡 Make sure the user has enabled notifications in the app");
      return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
    console.log(`📱 Found ${tokens.length} device(s)`);

    // Send notification to each token
    let successCount = 0;
    let failureCount = 0;
    
    for (const token of tokens) {
      try {
        const message = {
          notification: {
            title: "🎉 Test Notification",
            body: "This is a test notification from CODE 404 Dev Club! Everything is working perfectly.",
          },
          data: {
            type: "test",
            url: "/dashboard",
            timestamp: new Date().toISOString(),
          },
          token: token,
        };

        await admin.messaging().send(message);
        successCount++;
      } catch (error) {
        console.error(`   Failed for token: ${error.message}`);
        failureCount++;
      }
    }

    console.log(`✅ Notification sent!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failure: ${failureCount}`);

    // Also store in Firestore
    await db.collection("notifications").add({
      userId,
      title: "🎉 Test Notification",
      body: "This is a test notification from CODE 404 Dev Club! Everything is working perfectly.",
      type: "test",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("💾 Notification also saved to Firestore");
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    process.exit(1);
  }
}

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
  console.log("Usage: node scripts/send-test-notification.js <userId>");
  console.log("Example: node scripts/send-test-notification.js geetansh-1");
  process.exit(1);
}

sendTestNotification(userId)
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
