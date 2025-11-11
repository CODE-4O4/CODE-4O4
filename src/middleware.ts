import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/projects",
    "/events", 
    "/sessions",
    "/leaderboard",
  ];
  
  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Get user cookie
  const userCookie = request.cookies.get("code404-user");
  
  // If accessing a protected route without authentication, redirect to home
  if (!isPublicRoute && !userCookie) {
    console.log(`🔒 Unauthorized access to ${pathname}, redirecting to home`);
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // If user is authenticated, parse the cookie
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch (error) {
      console.error("Failed to parse user cookie:", error);
      // Invalid cookie, clear it and redirect to home if accessing protected route
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("code404-user");
      return response;
    }
  }
  
  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "admin") {
      console.log(`🔒 Non-admin user trying to access ${pathname}, redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  // Protect dashboard routes (require authentication)
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      console.log(`🔒 Unauthenticated access to ${pathname}, redirecting to home`);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
