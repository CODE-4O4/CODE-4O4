import { NextResponse } from "next/server";
import { getDb, serverTimestamp } from "@/lib/firebase/admin";

export const runtime = "nodejs";



export async function GET(request: Request) {
  try {
    console.log("🔄 Fetching members from Firestore...");
    const db = getDb();
    
    
    const cookieHeader = request.headers.get("cookie");
    let isAdmin = false;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('code404-user='));
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          isAdmin = user && user.role === 'admin';
        } catch {  }
      }
    }

    const membersSnapshot = await db.collection("members").get();

    
    const members = membersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        
        email: isAdmin ? data.email : undefined, 
        role: data.role,
        avatar: data.avatar,
        points: data.points || 0,
        badges: data.badges || 0,
        github: data.github,
        portfolio: data.portfolio,
        joinedAt: data.joinedAt,
        
      };
    });

    console.log(`✅ Fetched ${members.length} members`);
    return NextResponse.json({
      ok: true,
      data: members
    });
  } catch (error) {
    console.warn("⚠️  Failed to fetch members:", String(error));
    return NextResponse.json({
      ok: false,
      message: "Failed to fetch members",
      error: String(error)
    }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      avatar?: string;
      points?: number;
      badges?: number;
    };

    console.log("📝 Received member request:", body);

    const { id, name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, message: "Name and email are required" },
        { status: 400 },
      );
    }

    try {
      const db = getDb();

      const memberData = {
        name,
        email,
        role: role || "student",
        avatar: body.avatar || "",
        points: body.points || 0,
        badges: body.badges || 0,
        updatedAt: serverTimestamp(),
      };

      let docRef;
      if (id) {
        
        await db.collection("members").doc(id).update(memberData);
        console.log("✅ Updated member:", id);
        docRef = { id };
      } else {
        
        docRef = await db.collection("members").add({
          ...memberData,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Created new member:", docRef.id);
      }

      return NextResponse.json({
        ok: true,
        message: id ? "Member updated" : "Member created",
        data: { id: id || docRef.id }
      });
    } catch (firestoreError) {
      console.error("❌ Firestore operation failed:", String(firestoreError));
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to save member. Please check your database connection.",
          error: String(firestoreError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Member operation error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to save member",
        error: String(error)
      },
      { status: 500 },
    );
  }
}
