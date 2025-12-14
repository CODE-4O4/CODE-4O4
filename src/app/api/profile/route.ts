import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/firebase/admin";


export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        ok: false,
        message: "User ID is required",
      });
    }

    const db = getDb();
    
    console.log("🔄 Fetching profile for user:", userId);
    
    
    const userDoc = await db.collection("members").doc(userId).get();

    if (!userDoc.exists) {
      console.log("ℹ️  Profile not found for user:", userId);
      return NextResponse.json({
        ok: false,
        message: "Profile not found",
      });
    }

    const profileData = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    console.log("✅ Profile fetched:", profileData);

    return NextResponse.json({
      ok: true,
      data: profileData,
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch profile",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();
    const userId = updates.id;

    if (!userId) {
      return NextResponse.json({
        ok: false,
        message: "User ID is required",
      });
    }

    console.log("💾 Updating profile for user:", userId);

    const db = getDb();
    const userRef = db.collection("members").doc(userId);

    
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      
      await userRef.set({
        ...updates,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Profile created:", userId);
    } else {
      
      const allowedFields = [
        'name',
        'email',
        'phone',
        'github',
        'portfolio',
        'bio',
        'skills',
        'interests',
        'experience',
        'availability',
        'role',
        'avatar',
      ];

      const updateData: any = {
        updatedAt: new Date(),
      };

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      
      await userRef.update(updateData);
      console.log("✅ Profile updated:", userId);
    }

    return NextResponse.json({
      ok: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
