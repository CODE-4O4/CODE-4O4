import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/firebase/admin";


export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({
        ok: false,
        message: "Project ID is required",
      });
    }

    const db = getDb();
    
    console.log("🔄 Fetching members for project:", projectId);
    
    
    const membersSnapshot = await db
      .collection("projectMembers")
      .where("projectId", "==", projectId)
      .get();

    if (membersSnapshot.empty) {
      console.log("ℹ️  No members found for project:", projectId);
      return NextResponse.json({
        ok: true,
        data: [],
      });
    }

    const members = membersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName,
        // userEmail removed from public response for privacy
        role: data.role,
        joinedAt: data.joinedAt,
      };
    });

    console.log(`✅ Found ${members.length} members for project:`, projectId);

    return NextResponse.json({
      ok: true,
      data: members,
    });
  } catch (error) {
    console.error("❌ Error fetching project members:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch project members",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
