import { NextResponse } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";

export const runtime = "nodejs";


export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    let isAuthorized = false;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('code404-user='));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          isAuthorized = user && (user.role === 'admin' || user.role === 'mentor');
        } catch {  }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    
    console.log("🔄 Fetching project interests...", { projectId, status });
    const db = getDb();
    
    let query = db.collection("projectInterests");
    
    if (projectId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.where("projectId", "==", projectId) as any;
    }
    if (status) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = query.where("status", "==", status) as any;
    }
    
    const snapshot = await query.get();
    const interests = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        
        let projectName = data.projectId || "Unknown Project";
        try {
          
          const projectDoc = await db.collection("projects").doc(data.projectId).get();
          if (projectDoc.exists) {
            projectName = projectDoc.data()?.title || projectName;
          } else {
            
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
        
        
        let userName = data.userId || "Unknown User";
        let userEmail = "";
        try {
          
          const userDoc = await db.collection("members").doc(data.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || userName;
            userEmail = userData?.email || "";
          } else {
            
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


export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      interestId?: string;
      status?: "approved" | "rejected" | "pending";
      projectId?: string;
      userId?: string;
      deleteAfter?: boolean; 
      ownerId?: string; 
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
      
      
      const interestDoc = await db.collection("projectInterests").doc(interestId).get();
      
      if (!interestDoc.exists) {
        return NextResponse.json(
          { ok: false, message: "Project interest not found" },
          { status: 404 },
        );
      }
      
      const interestData = interestDoc.data();
      const projectId = body.projectId || interestData?.projectId;
      const userId = body.userId || interestData?.userId;
      
      
      if (status === "approved" && projectId && userId) {
        
        let userName = "Unknown User";
        let userEmail = "";
        
        try {
          const userDoc = await db.collection("members").doc(userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || userName;
            userEmail = userData?.email || "";
          }
        } catch (err) {
          console.warn("⚠️  Could not fetch user details:", err);
        }
        
        
        await db.collection("projectMembers").add({
          projectId,
          userId,
          userName,
          userEmail,
          role: "member",
          joinedAt: serverTimestamp(),
          addedBy: body.ownerId || "project-owner",
        });
        
        console.log(`✅ Added user ${userId} to projectMembers for project ${projectId}`);
        
        
        try {
          const userRef = db.collection("members").doc(userId);
          const userDoc = await userRef.get();
          if (userDoc.exists) {
            const currentPoints = userDoc.data()?.points || 0;
            await userRef.update({
              points: currentPoints + 10, 
              updatedAt: new Date(),
            });
            console.log(`🏆 Awarded 10 points to user ${userId} for joining project`);
          }
        } catch (pointsError) {
          console.warn("⚠️  Failed to award points:", pointsError);
          
        }
      }
      
      
      await db.collection("adminDecisions").add({
        type: "project_interest",
        interestId,
        projectId,
        userId,
        decision: status,
        decidedBy: body.ownerId || "owner",
        timestamp: serverTimestamp(),
        interestData,
      });
      
      console.log("✅ Recorded decision in adminDecisions");
      
      
      await db.collection("projectInterests").doc(interestId).delete();
      console.log(`🗑️  Deleted project interest ${interestId}`);
      
      return NextResponse.json({ 
        ok: true, 
        message: `Request ${status}!`,
        data: { id: interestId, status, deleted: true }
      });
    } catch (firestoreError) {
      console.error("❌ Firestore update failed:", String(firestoreError));
      return NextResponse.json(
        { 
          ok: false, 
          message: `Failed to ${status} request. Please check your database connection.`,
          error: String(firestoreError)
        },
        { status: 500 }
      );
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


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interestId = searchParams.get("id");
    
    if (!interestId) {
      return NextResponse.json(
        { ok: false, message: "Missing interest ID" },
        { status: 400 },
      );
    }
    
    console.log("🗑️  Deleting project interest:", interestId);
    const db = getDb();
    
    await db.collection("projectInterests").doc(interestId).delete();
    
    console.log("✅ Deleted project interest");
    return NextResponse.json({ 
      ok: true, 
      message: "Interest deleted" 
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Failed to delete",
      error: String(error)
    }, { status: 500 });
  }
}
