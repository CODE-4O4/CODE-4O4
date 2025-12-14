import { NextResponse } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";
import { sendCredentialsEmail } from "@/lib/email";
import { hashPassword, generateSecurePassword } from "@/lib/auth-utils";

export const runtime = "nodejs";


export async function GET(request: Request) {
  try {
    // Authentication check - only admins can view pending members
    const cookieHeader = request.headers.get("cookie");
    let isAdmin = false;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('code404-user='));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          isAdmin = user && (user.role === 'admin' || user.role === 'mentor');
        } catch {  }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    console.log("🔄 Fetching pending members...");
    const db = getDb();

    
    const snapshot = await db
      .collection("pendingMembers")
      .where("status", "==", "pending")
      .get();

    
    const pendingMembers = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => {
        
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
        return bTime - aTime;
      });

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
    let username = null;
    let password = null;

    if (decision === "approved") {
      
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      
      const firstName = (memberData?.name || "member").split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

      username = firstName;

      
      password = generateSecurePassword(12);

      
      const hashedPassword = await hashPassword(password);

      
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
        username,
        password: hashedPassword,
        credentialsUpdated: new Date().toISOString(),
      });

      console.log("✅ Added to members collection with ID:", userId, "(username:", username, ")");

      
      if (memberData?.email) {
        try {
          console.log(`📧 Attempting to send welcome email to ${memberData.email}...`);

          const emailResult = await sendCredentialsEmail({
            to: memberData.email,
            name: memberData.name || "Member",
            username: username,
            password: password,
          });

          if (emailResult.success) {
            console.log(`✅ Welcome email sent successfully to ${memberData.email}`);
            console.log(`   Message ID: ${emailResult.messageId}`);
          } else {
            console.error(`❌ Failed to send welcome email: ${emailResult.error}`);
          }
        } catch (emailError) {
          console.error("❌ Error sending welcome email:", emailError);
          console.error("   Full error:", JSON.stringify(emailError, null, 2));
          
        }
      } else {
        console.warn('⚠️  No email address found for member, skipping email send');
      }
    }

    
    await db.collection("adminDecisions").add({
      type: "member_approval",
      memberId,
      decision,
      adminId: adminId || "admin",
      memberData,
      timestamp: serverTimestamp(),
    });

    console.log("✅ Recorded admin decision");

    
    await db.collection("pendingMembers").doc(memberId).delete();

    console.log("✅ Deleted from pendingMembers");

    return NextResponse.json({
      ok: true,
      message: decision === "approved"
        ? `Member approved! Welcome email sent to ${memberData?.email}`
        : `Member ${decision}!`,
      ...(userId && { userId }),
      // Credentials removed from response for security - sent via email only
      ...(memberData?.name && { name: memberData.name }),
      ...(memberData?.email && { email: memberData.email }),
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
