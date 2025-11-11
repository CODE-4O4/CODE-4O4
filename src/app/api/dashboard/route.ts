import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    console.log("🔄 Fetching dashboard data for user:", userId);

    const db = getDb();

    // Get user data from members collection
    const memberDoc = await db.collection("members").doc(userId).get();
    
    if (!memberDoc.exists) {
      return NextResponse.json(
        { ok: false, message: "Member not found" },
        { status: 404 },
      );
    }

    const memberData = memberDoc.data();

    // Get user's projects - both as member and as owner
    // 1. Get projects where user is a member
    const projectMembersQuery = await db
      .collection("projectMembers")
      .where("userId", "==", userId)
      .get();

    const memberProjectIds = projectMembersQuery.docs.map(doc => doc.data().projectId);
    
    // 2. Get projects where user is the owner
    const ownedProjectsQuery = await db
      .collection("projects")
      .where("ownerId", "==", userId)
      .get();

    const ownedProjects = ownedProjectsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Get member project details
    let memberProjects: any[] = [];
    if (memberProjectIds.length > 0) {
      const projectsPromises = memberProjectIds.map(async (projectId) => {
        const projectDoc = await db.collection("projects").doc(projectId).get();
        if (projectDoc.exists) {
          return { id: projectDoc.id, ...projectDoc.data() };
        }
        return null;
      });
      const projectsResults = await Promise.all(projectsPromises);
      memberProjects = projectsResults.filter(p => p !== null);
    }

    // Combine owned and member projects, remove duplicates by id
    const allProjectsMap = new Map();
    [...ownedProjects, ...memberProjects].forEach(project => {
      if (project && !allProjectsMap.has(project.id)) {
        allProjectsMap.set(project.id, project);
      }
    });
    const userProjects = Array.from(allProjectsMap.values());

    // Get upcoming sessions (next 5)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const sessionsQuery = await db
      .collection("sessions")
      .where("date", ">=", todayStr)
      .orderBy("date", "asc")
      .limit(5)
      .get();

    const sessions = sessionsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get upcoming events count for stats
    const eventsQuery = await db
      .collection("events")
      .where("date", ">=", todayStr)
      .get();

    // Calculate stats
    const stats = {
      activeProjects: userProjects.length,
      upcomingEvents: eventsQuery.size,
      upcomingSessions: sessions.length,
    };

    console.log("✅ Dashboard data fetched:", { stats, projectsCount: userProjects.length });

    return NextResponse.json({
      ok: true,
      data: {
        member: {
          id: memberDoc.id,
          name: memberData?.name || "Member",
          email: memberData?.email || "",
          role: memberData?.role || "student",
          avatar: memberData?.avatar || "",
        },
        stats,
        projects: userProjects,
        sessions,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch dashboard data",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
