import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/firebase/admin";
import { comparePassword } from "@/lib/auth-utils";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.AUTH);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "Username and password are required" },
        { status: 400 },
      );
    }

    console.log("🔐 Login attempt for username:", username);

    const db = getDb();

    
    const normalizedUsername = username.trim().toLowerCase();

    const membersSnapshot = await db
      .collection("members")
      .where("username", "==", normalizedUsername)
      .limit(1)
      .get();

    if (membersSnapshot.empty) {
      console.log("❌ No member found with username:", normalizedUsername);
      return NextResponse.json(
        { ok: false, message: "No member found with that username." },
        { status: 401 },
      );
    }

    const memberDoc = membersSnapshot.docs[0];
    const memberData = memberDoc.data();

    
    const isPasswordValid = await comparePassword(password, memberData.password || '');

    if (!isPasswordValid) {
      console.log("❌ Incorrect password for user:", normalizedUsername);
      return NextResponse.json(
        { ok: false, message: "Incorrect password. Try again." },
        { status: 401 },
      );
    }

    
    const userProfile = {
      id: memberDoc.id,
      name: memberData.name,
      email: memberData.email,
      avatar: memberData.avatar,
      role: memberData.role || "student",
      badges: memberData.badges || 0,
      points: memberData.points || 0,
      github: memberData.github,
      portfolio: memberData.portfolio,
    };

    console.log("✅ Login successful for:", memberData.name);

    return NextResponse.json({
      ok: true,
      message: `Welcome back, ${memberData.name.split(" ")[0]}!`,
      user: userProfile,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Login failed",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
