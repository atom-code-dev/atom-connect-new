import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register-organization"];
  
  // If the path is public, allow access
  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // Check if the path is a dashboard or protected route
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/admin") || 
      pathname.startsWith("/freelancer") || 
      pathname.startsWith("/organization") || 
      pathname.startsWith("/maintainer") ||
      pathname.startsWith("/complete-freelancer-profile")) {
    
    try {
      // Check authentication using NextAuth JWT token
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
      });
      
      if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackURL", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // If there's an error checking the token, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackURL", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};