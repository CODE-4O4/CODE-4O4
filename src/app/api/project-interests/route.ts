import { NextResponse } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// GET - Fetch project interests (optionally filtered)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    
    console.log("🔄 Fetching project interests...", { projectId, status });
    const db = getDb();
    
    let query = db.collection("projectInterests");
    
    if (projectId) {
      query = query.where("projectId", "==", projectId) as any;
    }
    if (status) {
      query = query.where("status", "==", status) as any;
    }
    
    const snapshot = await query.get();
    const interests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Try to fetch project details, fallback to projectId
        let projectName = data.projectId || "Unknown Project";
        try {
          // First try by document ID
          const projectDoc = await db.collection("projects").doc(data.projectId).get();
          if (projectDoc.exists) {
            projectName = projectDoc.data()?.title || projectName;
          } else {
            // Try to find by matching ID field
            const projectQuery = await db.collection("projects")
              .where("id", "==", data.projectId)
              .limit(1)
              .get();
            if (!projectQuery.empty) {
              projectName = projectQuery.docs[0].data()?.title || projectName;
            }
          }
        } catch (err) {
          console.warn("⚠️  Could not fetch project details:", err);
        }
        
        // Try to fetch user details, fallback to userId
        let userName = data.userId || "Unknown User";
        let userEmail = "";
        try {
          // First try by document ID
          const userDoc = await db.collection("members").doc(data.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || userName;
            userEmail = userData?.email || "";
          } else {
            // Try to find by matching ID field
            const userQuery = await db.collection("members")
              .where("id", "==", data.userId)
              .limit(1)
              .get();
            if (!userQuery.empty) {
              const userData = userQuery.docs[0].data();
              userName = userData?.name || userName;
              userEmail = userData?.email || "";
            }
          }
        } catch (err) {
          console.warn("⚠️  Could not fetch user details:", err);
        }
        
        return {
          id: doc.id,
          ...data,
          projectName,
          userName,
          userEmail,
        };
      })
    );
    
    console.log(`✅ Fetched ${interests.length} project interests with details`);
    return NextResponse.json({ 
      ok: true, 
      data: interests 
    });
  } catch (error) {
    console.error("❌ Failed to fetch project interests:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Failed to fetch interests",
      error: String(error)
    }, { status: 500 });
  }
}

// PATCH - Update project interest status (approve/reject)
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      interestId?: string;
      status?: "approved" | "rejected" | "pending";
      projectId?: string;
      userId?: string;
    };
    
    console.log("📝 Updating project interest:", body);
    
    const { interestId, status } = body;
    
    if (!interestId || !status) {
      return NextResponse.json(
        { ok: false, message: "Missing interestId or status" },
        { status: 400 },
      );
    }
    
    try {
      const db = getDb();
      
      await db.collection("projectInterests").doc(interestId).update({
        status,
        updatedAt: serverTimestamp(),
        decidedAt: status !== "pending" ? serverTimestamp() : null,
      });
      
      console.log(`✅ Updated project interest ${interestId} to ${status}`);
      
      // If approved, optionally add to interestedParticipants
      if (status === "approved" && body.projectId && body.userId) {
        await db.collection("interestedParticipants").add({
          projectId: body.projectId,
          userId: body.userId,
          joinedAt: serverTimestamp(),
        });
        console.log("✅ Added to interestedParticipants");
      }
      
      return NextResponse.json({ 
        ok: true, 
        message: `Request ${status}!`,
        data: { id: interestId, status }
      });
    } catch (firestoreError) {
      console.warn("⚠️  Firestore update failed:", String(firestoreError));
      return NextResponse.json({ 
        ok: true, 
        message: `Request ${status} (Demo mode)` 
      });
    }
  } catch (error) {
    console.error("❌ Update project interest error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        message: "Failed to update interest",
        error: String(error)
      },
      { status: 500 },
    );
  }
}
