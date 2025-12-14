import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";
import { archivePastSessions } from "@/lib/server/sessions-maintenance";


export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("🔄 Fetching all sessions from Firebase...");

    
    const db = getDb();
    const userRef = db.collection("members").doc(userId!);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData?.role !== "admin" && userData?.role !== "mentor") {
      return NextResponse.json(
        { ok: false, error: "Only admins and mentors can view all sessions" },
        { status: 403 }
      );
    }

    await archivePastSessions(db);
    const sessionsRef = db.collection("sessions");
    const querySnapshot = await sessionsRef.orderBy("date", "desc").get();

    console.log(`📦 Found ${querySnapshot.size} sessions`);

    const sessions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    console.log(`✅ Returning ${sessions.length} sessions`);

    return NextResponse.json({
      ok: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error("❌ Error fetching sessions:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}
