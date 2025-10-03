import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Simple protection: only redirect if someone tries to access dashboard directly
  // This is a minimal approach to avoid redirect loops
  if (pathname.startsWith("/dashboard") && !pathname.includes("/api/")) {
    // Check if we have a session cookie (simple check)
    const hasSessionCookie = request.cookies.get("next-auth.session-token") || 
                           request.cookies.get("__Secure-next-auth.session-token");
    
    if (!hasSessionCookie) {
      const loginUrl = new URL("/login", request.url);
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