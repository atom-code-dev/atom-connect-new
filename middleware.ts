import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    
    // For now, allow access to all protected routes
    // The individual pages will handle authentication state
    // This prevents redirect loops while we debug the authentication
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};