import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/firebase/admin";


export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;
    const { projectId } = await request.json();

    console.log("🗑️  Removing member:", memberId, "from project:", projectId);

    const db = getDb();
    
    
    await db.collection("projectMembers").doc(memberId).delete();

    console.log("✅ Member removed successfully:", memberId);

    return NextResponse.json({
      ok: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("❌ Error removing member:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to remove member",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
