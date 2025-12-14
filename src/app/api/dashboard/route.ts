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

    
    const memberDoc = await db.collection("members").doc(userId).get();

    if (!memberDoc.exists) {
      return NextResponse.json(
        { ok: false, message: "Member not found" },
        { status: 404 },
      );
    }

    const memberData = memberDoc.data();

    
    
    const projectMembersQuery = await db
      .collection("projectMembers")
      .where("userId", "==", userId)
      .get();

    const memberProjectIds = projectMembersQuery.docs.map(doc => doc.data().projectId);

    
    const ownedProjectsQuery = await db
      .collection("projects")
      .where("ownerId", "==", userId)
      .get();

    const ownedProjects = ownedProjectsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    
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

    
    const allProjectsMap = new Map();
    [...ownedProjects, ...memberProjects].forEach(project => {
      if (project && !allProjectsMap.has(project.id)) {
        allProjectsMap.set(project.id, project);
      }
    });
    const userProjects = Array.from(allProjectsMap.values());

    
    const projectIds = userProjects.map((project) => project.id);
    const memberCounts = new Map<string, number>();
    await Promise.all(
      projectIds.map(async (projectId) => {
        try {
          const snap = await db
            .collection("projectMembers")
            .where("projectId", "==", projectId)
            .get();
          memberCounts.set(projectId, snap.size);
        } catch (err) {
          console.warn("⚠️ Failed to count members for project", projectId, err);
          memberCounts.set(projectId, 0);
        }
      }),
    );
    const projectsWithCounts = userProjects.map((project) => ({
      ...project,
      memberCount: memberCounts.get(project.id) ?? project.members ?? 0,
    }));

    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; 

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

    
    const eventsQuery = await db
      .collection("events")
      .where("date", ">=", todayStr)
      .get();

    
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
          points: memberData?.points || 0,
          badges: memberData?.badges || 0,
          github: memberData?.github,
          portfolio: memberData?.portfolio,
          
        },
        stats,
        projects: projectsWithCounts,
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
