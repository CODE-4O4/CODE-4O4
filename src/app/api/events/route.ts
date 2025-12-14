import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";


export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("🔄 Fetching events from Firebase...");

    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; 

    const db = getDb();
    const eventsRef = db.collection("events");
    
    const querySnapshot = await eventsRef
      .where("date", ">=", todayStr)
      .orderBy("date", "asc")
      .get();

    console.log(`📦 Found ${querySnapshot.size} events`);

    const events = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    console.log(`✅ Returning ${events.length} events`);

    return NextResponse.json({
      ok: true,
      data: events,
    });
  } catch (error: any) {
    console.error("❌ Error fetching events:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}
