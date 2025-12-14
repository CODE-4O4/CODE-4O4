import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  try {
    // Authentication check - only admins can view registrations
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
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const db = getDb();
    const snapshot = await db.collection("hackathon_registrations").orderBy("createdAt", "desc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, registrations: data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Admin GET registrations error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
