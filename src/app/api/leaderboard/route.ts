import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/firebase/admin";


export const runtime = "nodejs";


export async function POST(request: NextRequest) {
  try {
    // Admin-only: prevent unauthorized point manipulation
    const cookieHeader = request.headers.get("cookie");
    let isAdmin = false;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('code404-user='));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          isAdmin = user && (user.role === 'admin' || user.role === 'mentor');
        } catch {  }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { userId, action, value } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({
        ok: false,
        message: "User ID and action are required",
      });
    }

    console.log(`🏆 Updating stats for user ${userId}: ${action}`, value);

    const db = getDb();
    const userRef = db.collection("members").doc(userId);

    
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({
        ok: false,
        message: "User not found",
      }, { status: 404 });
    }

    const currentData = userDoc.data();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      updatedAt: new Date(),
    };

    
    switch (action) {
      case "addPoints":
        updates.points = (currentData?.points || 0) + (value || 0);
        console.log(`✅ Adding ${value} points. New total: ${updates.points}`);
        break;

      case "addBadge":
        updates.badges = (currentData?.badges || 0) + 1;
        console.log(`✅ Adding badge. New total: ${updates.badges}`);
        break;

      case "completeProject":
        updates.projectsCompleted = (currentData?.projectsCompleted || 0) + 1;
        updates.points = (currentData?.points || 0) + 50; 
        console.log(`✅ Project completed. New total: ${updates.projectsCompleted}`);
        break;

      case "joinProject":
        updates.points = (currentData?.points || 0) + 10; 
        console.log(`✅ Joined project. Points awarded: 10`);
        break;

      case "attendEvent":
        updates.points = (currentData?.points || 0) + 25; 
        console.log(`✅ Attended event. Points awarded: 25`);
        break;

      case "setPoints":
        updates.points = value || 0;
        console.log(`✅ Setting points to: ${updates.points}`);
        break;

      case "setBadges":
        updates.badges = value || 0;
        console.log(`✅ Setting badges to: ${updates.badges}`);
        break;

      default:
        return NextResponse.json({
          ok: false,
          message: `Unknown action: ${action}`,
        }, { status: 400 });
    }

    
    await userRef.update(updates);

    console.log(`✅ Stats updated successfully for user: ${userId}`);

    return NextResponse.json({
      ok: true,
      message: "Stats updated successfully",
      data: updates,
    });
  } catch (error) {
    console.error("❌ Error updating stats:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update stats",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const db = getDb();

    if (userId) {
      
      const userDoc = await db.collection("members").doc(userId).get();
      if (!userDoc.exists) {
        return NextResponse.json({
          ok: false,
          message: "User not found",
        }, { status: 404 });
      }

      const userData = userDoc.data();
      return NextResponse.json({
        ok: true,
        data: {
          id: userDoc.id,
          name: userData?.name,
          // Email removed from public response for privacy
          role: userData?.role,
          avatar: userData?.avatar,
          points: userData?.points || 0,
          badges: userData?.badges || 0,
          github: userData?.github,
          portfolio: userData?.portfolio,
          projectsCompleted: userData?.projectsCompleted || 0,
          
        },
      });
    }

    
    const usersSnapshot = await db
      .collection("members")
      .orderBy("points", "desc")
      .limit(limit)
      .get();

    const leaderboard = usersSnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        id: doc.id,
        name: data.name,
        // Email removed from public response for privacy
        role: data.role,
        avatar: data.avatar,
        points: data.points || 0,
        badges: data.badges || 0,
        github: data.github,
        portfolio: data.portfolio,
        projectsCompleted: data.projectsCompleted || 0,
        
      };
    });

    return NextResponse.json({
      ok: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch leaderboard",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
