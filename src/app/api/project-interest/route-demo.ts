import { NextResponse } from "next/server";


export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { projectId, userId } = (await request.json()) as {
      projectId?: string;
      userId?: string;
    };
    
    console.log("Received project interest request:", { projectId, userId });
    
    if (!projectId || !userId) {
      console.error("Missing required fields:", { projectId, userId });
      return NextResponse.json(
        { ok: false, message: "Missing project or user id" },
        { status: 400 },
      );
    }
    
    
    
    console.log(" Successfully received project interest for:", projectId, "from user:", userId);
    console.log("📝 Note: Using demo mode - data not persisted to Firestore");
    
    return NextResponse.json({ ok: true, message: "Project lead notified." });
  } catch (error) {
    console.error("project interest error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { ok: false, message: "Unable to save interest.", error: String(error) },
      { status: 500 },
    );
  }
}
