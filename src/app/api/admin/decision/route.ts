import { NextResponse, NextRequest } from "next/server";
import { getDb, serverTimestamp, getMessaging } from "@/lib/firebase/admin";
import { verifyAdminAuth } from "@/lib/auth-utils";


export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    
    const auth = await verifyAdminAuth(request);
    if (!auth.isAdmin) {
      return NextResponse.json(
        { ok: false, message: auth.error || "Unauthorized" },
        { status: 401 },
      );
    }

    const { id, decision } = (await request.json()) as {
      id?: string;
      decision?: "approve" | "hold" | string;
    };

    if (!id || !decision) {
      return NextResponse.json(
        { ok: false, message: "Missing id or decision" },
        { status: 400 },
      );
    }

    const db = getDb();
    
    
    await db.collection("adminDecisions").add({
      requestId: id,
      decision,
      actedBy: auth.user?.name || "Admin",
      actedAt: serverTimestamp(),
    });
    
    
    const requestDoc = await db.collection("pendingMembers").doc(id).get();
    if (requestDoc.exists) {
      const requestData = requestDoc.data();
      
      
      if (decision === "approve" && requestData?.email) {
        
        const membersSnapshot = await db
          .collection("members")
          .where("email", "==", requestData.email)
          .limit(1)
          .get();
        
        if (!membersSnapshot.empty) {
          const memberDoc = membersSnapshot.docs[0];
          const memberData = memberDoc.data();
          
          
          if (memberData?.fcmTokens && memberData.fcmTokens.length > 0) {
            const messaging = getMessaging();
            const notificationTitle = "Welcome to DevForge! 🎉";
            const notificationBody = "Your membership has been approved. Welcome to the team!";
            
            for (const token of memberData.fcmTokens) {
              try {
                if (messaging) {
                  await messaging.send({
                    token,
                    notification: {
                      title: notificationTitle,
                      body: notificationBody,
                    },
                    data: {
                      url: `/dashboard`,
                    },
                    webpush: {
                      fcmOptions: {
                        link: `/dashboard`,
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
              userId: memberDoc.id,
              title: notificationTitle,
              body: notificationBody,
              url: `/dashboard`,
              icon: "/android-chrome-192x192.png",
              read: false,
              createdAt: serverTimestamp(),
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Decision recorded." });
  } catch (error) {
    console.error("admin decision error", error);
    return NextResponse.json(
      { ok: false, message: "Unable to persist decision.", error: String(error) },
      { status: 500 },
    );
  }
}
