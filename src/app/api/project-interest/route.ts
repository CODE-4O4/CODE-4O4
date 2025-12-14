import { NextResponse } from "next/server";
import { getDb, serverTimestamp, getMessaging } from "@/lib/firebase/admin";


export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { projectId, userId } = (await request.json()) as {
      projectId?: string;
      userId?: string;
    };
    
    console.log("📝 Received project interest request:", { projectId, userId });
    
    if (!projectId || !userId) {
      console.error("❌ Missing required fields:", { projectId, userId });
      return NextResponse.json(
        { ok: false, message: "Missing project or user id" },
        { status: 400 },
      );
    }
    
    try {
      console.log("🔄 Getting Firestore database...");
      const db = getDb();
      
      console.log("💾 Writing to projectInterests collection...");
      const docRef = await db.collection("projectInterests").add({
        projectId,
        userId,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      
      
      const projectDoc = await db.collection("projects").doc(projectId).get();
      const projectData = projectDoc.data();
      
      
      const userDoc = await db.collection("members").doc(userId).get();
      const userData = userDoc.data();
      
      
      if (projectData?.ownerId) {
        const ownerDoc = await db.collection("members").doc(projectData.ownerId).get();
        const ownerData = ownerDoc.data();
        
        if (ownerData?.fcmTokens && ownerData.fcmTokens.length > 0) {
          const messaging = getMessaging();
          const notificationTitle = `New Interest: ${projectData?.title || "Your Project"}`;
          const notificationBody = `${userData?.name || "Someone"} is interested in joining your project`;
          
          
          for (const token of ownerData.fcmTokens) {
            try {
              if (messaging) {
                await messaging.send({
                  token,
                  notification: {
                    title: notificationTitle,
                    body: notificationBody,
                  },
                  data: {
                    url: `/projects`,
                    projectId,
                    userId,
                  },
                  webpush: {
                    fcmOptions: {
                      link: `/projects`,
                    },
                    notification: {
                      icon: "/android-chrome-192x192.png",
                    },
                  },
                });
              }
            } catch (msgError) {
              console.error("Failed to send notification:", msgError);
            }
          }
          
          
          await db.collection("notifications").add({
            userId: projectData.ownerId,
            title: notificationTitle,
            body: notificationBody,
            url: `/projects`,
            icon: "/android-chrome-192x192.png",
            read: false,
            createdAt: serverTimestamp(),
          });
        }
      }
      
      
      if (userData?.fcmTokens && userData.fcmTokens.length > 0) {
        const messaging = getMessaging();
        const confirmTitle = `Interest Registered: ${projectData?.title || "Project"}`;
        const confirmBody = "The project lead has been notified of your interest";
        
        for (const token of userData.fcmTokens) {
          try {
            if (messaging) {
              await messaging.send({
                token,
                notification: {
                  title: confirmTitle,
                  body: confirmBody,
                },
                data: {
                  url: `/projects`,
                  projectId,
                },
                webpush: {
                  fcmOptions: {
                    link: `/projects`,
                  },
                  notification: {
                    icon: "/android-chrome-192x192.png",
                  },
                },
              });
            }
          } catch (msgError) {
            console.error("Failed to send confirmation:", msgError);
          }
        }
        
        
        await db.collection("notifications").add({
          userId,
          title: confirmTitle,
          body: confirmBody,
          url: `/projects`,
          icon: "/android-chrome-192x192.png",
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      
      console.log("✅ Successfully saved project interest with ID:", docRef.id);
      return NextResponse.json({ 
        ok: true, 
        message: "Project lead notified.",
        data: { id: docRef.id }
      });
    } catch (firestoreError) {
      console.error("❌ Firestore save failed:", String(firestoreError));
      return NextResponse.json(
        { 
          ok: false, 
          message: "Failed to save interest. Please check your database connection.",
          error: String(firestoreError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ project interest error:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to save interest.", error: String(error) },
      { status: 500 },
    );
  }
}
