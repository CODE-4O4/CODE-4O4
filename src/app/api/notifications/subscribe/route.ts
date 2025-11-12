import { NextResponse, NextRequest } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";

// Force Node.js runtime for firebase-admin
export const runtime = "nodejs";

/**
 * POST /api/notifications/subscribe
 * Subscribe a device to receive notifications
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: "Missing userId or token" },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    console.log(`📱 Subscribing user ${userId} with token:`, token.substring(0, 20) + "...");

    // Save to fcmTokens collection (for easy querying by userId)
    await db.collection("fcmTokens").doc(token).set({
      userId,
      token,
      subscribedAt: serverTimestamp(),
      active: true,
      deviceInfo: {
        userAgent: request.headers.get("user-agent") || "unknown",
        lastSeen: serverTimestamp(),
      }
    });

    // Also save FCM token to user's document (for backup)
    const userRef = db.collection("members").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.warn(`⚠️ User ${userId} not found in members collection`);
      // Don't fail - still allow notification subscription
    } else {
      // Get existing tokens or create empty array
      const userData = userDoc.data();
      const existingTokens = userData?.fcmTokens || [];

      // Add new token if it doesn't exist
      if (!existingTokens.includes(token)) {
        await userRef.update({
          fcmTokens: [...existingTokens, token],
          lastTokenUpdate: serverTimestamp(),
        });
      }
    }

    console.log(`✅ Successfully subscribed user ${userId} to notifications`);

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to notifications",
    });
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to notifications" },
      { status: 500 }
    );
  }
}
