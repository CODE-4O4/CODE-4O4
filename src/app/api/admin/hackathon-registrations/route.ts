import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = getDb();
    const snapshot = await db.collection("hackathon_registrations").orderBy("createdAt", "desc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, registrations: data });
  } catch (error: any) {
    console.error("Admin GET registrations error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
