import { NextResponse } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// GET - Fetch all pending member requests
export async function GET(request: Request) {
  try {
    console.log("🔄 Fetching pending members...");
    const db = getDb();
    
    const snapshot = await db
      .collection("pendingMembers")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .get();
    
    const pendingMembers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    console.log(`✅ Found ${pendingMembers.length} pending members`);
    
    return NextResponse.json({
      ok: true,
      data: pendingMembers,
    });
  } catch (error) {
    console.error("❌ Error fetching pending members:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch pending members",
        error: String(error),
      },
      { status: 500 },
    );
  }
}

// PATCH - Approve or reject a pending member
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { memberId, decision, adminId } = body;
    
    if (!memberId || !decision) {
      return NextResponse.json(
        { ok: false, message: "Missing memberId or decision" },
        { status: 400 },
      );
    }
    
    console.log(`📝 Processing member ${decision}:`, memberId);
    
    const db = getDb();
    
    // Get the pending member data
    const pendingMemberDoc = await db
      .collection("pendingMembers")
      .doc(memberId)
      .get();
    
    if (!pendingMemberDoc.exists) {
      return NextResponse.json(
        { ok: false, message: "Pending member not found" },
        { status: 404 },
      );
    }
    
    const memberData = pendingMemberDoc.data();
    
    let userId = null;
    let tempPassword = null;
    
    if (decision === "approved") {
      // Create a unique user ID
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate a temporary password
      tempPassword = `Club@${Math.random().toString(36).substr(2, 8)}`;
      
      // Add to members collection
      await db.collection("members").doc(userId).set({
        id: userId,
        name: memberData?.name || "Unknown",
        email: memberData?.email || "",
        phone: memberData?.phone || "",
        github: memberData?.github || null,
        portfolio: memberData?.portfolio || null,
        interests: memberData?.interests || [],
        experience: memberData?.experience || "beginner",
        goals: memberData?.goals || "",
        role: memberData?.role || "student",
        availability: memberData?.availability || "",
        points: 0,
        badges: 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberData?.email || userId}`,
        joinedAt: serverTimestamp(),
        approvedBy: adminId || "admin",
        tempPassword, // Store temporarily for admin to send
      });
      
      console.log("✅ Added to members collection with ID:", userId);
    }
    
    // Record admin decision
    await db.collection("adminDecisions").add({
      type: "member_approval",
      memberId,
      decision,
      adminId: adminId || "admin",
      memberData,
      timestamp: serverTimestamp(),
    });
    
    console.log("✅ Recorded admin decision");
    
    // Delete from pendingMembers
    await db.collection("pendingMembers").doc(memberId).delete();
    
    console.log("✅ Deleted from pendingMembers");
    
    return NextResponse.json({
      ok: true,
      message: `Member ${decision}!`,
      ...(userId && { userId }),
      ...(tempPassword && { tempPassword }),
    });
  } catch (error) {
    console.error("❌ Error processing member:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to process member",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
