import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";
import { archivePastSessions } from "@/lib/server/sessions-maintenance";


export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("🔄 Fetching sessions from Firebase...");

    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; 

    const db = getDb();
    await archivePastSessions(db);
    const sessionsRef = db.collection("sessions");
    
    const querySnapshot = await sessionsRef
      .where("date", ">=", todayStr)
      .orderBy("date", "asc")
      .get();

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, weekday, topics, description, duration, location, userId } = body;

    console.log("🔄 Creating new session:", title);

    
    const db = getDb();
    const userRef = db.collection("members").doc(userId);
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
        { ok: false, error: "Only admins and mentors can create sessions" },
        { status: 403 }
      );
    }

    
    if (!title || !date) {
      return NextResponse.json(
        { ok: false, error: "Title and date are required" },
        { status: 400 }
      );
    }

    
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionData = {
      title,
      date,
      weekday: weekday || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      topics: topics || [],
      description: description || "",
      duration: duration || "90 minutes",
      location: location || "Online",
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: date < todayStr ? "archived" : "upcoming",
    };

    const sessionRef = await db.collection("sessions").add(sessionData);
    
    console.log("✅ Session created:", sessionRef.id);

    return NextResponse.json({
      ok: true,
      data: {
        id: sessionRef.id,
        ...sessionData,
      },
    });
  } catch (error: any) {
    console.error("❌ Error creating session:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to create session",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, title, date, weekday, topics, description, duration, location, userId } = body;

    console.log("🔄 Updating session:", sessionId);

    
    const db = getDb();
    const userRef = db.collection("members").doc(userId);
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
        { ok: false, error: "Only admins and mentors can update sessions" },
        { status: 403 }
      );
    }

    
    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    
    const sessionRef = db.collection("sessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    if (title !== undefined) updateData.title = title;
    if (date !== undefined) {
      updateData.date = date;
      const todayStr = new Date().toISOString().split('T')[0];
      updateData.status = date < todayStr ? "archived" : "upcoming";
    }
    if (weekday !== undefined) updateData.weekday = weekday;
    if (topics !== undefined) updateData.topics = topics;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (location !== undefined) updateData.location = location;

    await sessionRef.update(updateData);
    
    console.log("✅ Session updated:", sessionId);

    return NextResponse.json({
      ok: true,
      data: {
        id: sessionId,
        ...sessionDoc.data(),
        ...updateData,
      },
    });
  } catch (error: any) {
    console.error("❌ Error updating session:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to update session",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const userId = searchParams.get("userId");

    console.log("🔄 Deleting session:", sessionId);

    
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
        { ok: false, error: "Only admins and mentors can delete sessions" },
        { status: 403 }
      );
    }

    
    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    
    const sessionRef = db.collection("sessions").doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json(
        { ok: false, error: "Session not found" },
        { status: 404 }
      );
    }

    await sessionRef.delete();
    
    console.log("✅ Session deleted:", sessionId);

    return NextResponse.json({
      ok: true,
      message: "Session deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting session:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to delete session",
      },
      { status: 500 }
    );
  }
}
