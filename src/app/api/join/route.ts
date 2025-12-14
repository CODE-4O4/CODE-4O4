import { NextResponse } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";
import type { JoinRequestPayload } from "@/types";


export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as JoinRequestPayload;
    if (!payload.displayName || !payload.email || !payload.phone) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields." },
        { status: 400 },
      );
    }
    
    console.log("📝 Creating pending member request:", payload.email);
    
    const db = getDb();
    
    
    await db.collection("pendingMembers").add({
      name: payload.displayName,
      email: payload.email,
      phone: payload.phone,
      github: payload.github || null,
      portfolio: payload.portfolio || null,
      interests: payload.interests || [],
      experience: payload.experience || "beginner",
      goals: payload.goals || "",
      role: payload.role || "student",
      availability: payload.availability || "",
      createdAt: serverTimestamp(),
      status: "pending",
    });
    
    console.log("✅ Added to pendingMembers collection");
    
    return NextResponse.json({ ok: true, message: "Request received." });
  } catch (error) {
    console.error("❌ Join request error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Unable to store request. Check Firebase credentials.",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
