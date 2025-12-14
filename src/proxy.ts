import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;
    const hostname = request.headers.get("host") || "";

    
    
    
    
    const isHackathonSubdomain =
        hostname.startsWith("hackathon.") || hostname.startsWith("hacks.");

    if (isHackathonSubdomain) {
        
        

        
        
        if (!pathname.startsWith("/hackathon")) {
            return NextResponse.rewrite(new URL(`/hackathon${pathname}`, request.url));
        }
        
        return NextResponse.next();
    }

    
    
    

    
    const publicRoutes = [
        "/",
        "/sw.js", 
        "/manifest.json"
    ];

    
    
    
    const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith("/hackathon");

    
    const userCookie = request.cookies.get("code404-user");

    
    if (!isPublicRoute && !userCookie) {
        console.log(`🔒 Unauthorized access to ${pathname}, redirecting to home`);
        return NextResponse.redirect(new URL("/", request.url));
    }

    
    let user = null;
    if (userCookie) {
        try {
            
            const decodedValue = decodeURIComponent(userCookie.value);
            user = JSON.parse(decodedValue);
        } catch (error) {
            console.error("Failed to parse user cookie:", error);
            
            if (!isPublicRoute) {
                const response = NextResponse.redirect(new URL("/", request.url));
                response.cookies.delete("code404-user");
                return response;
            }
        }
    }

    
    
    if (pathname.startsWith("/admin") && !pathname.startsWith("/hackathon/admin")) {
        if (!user || (user.role !== "admin" && user.role !== "mentor")) {
            console.log(`🔒 Non-admin/mentor user trying to access ${pathname}, redirecting to dashboard`);
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    
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
        
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|.*\\.(?:png|jpg|jpeg|svg|ico|webp|json)).*)",
    ],
};
