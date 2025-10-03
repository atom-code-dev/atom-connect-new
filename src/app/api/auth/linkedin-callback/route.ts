import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: Request) {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      // Check if user has a role set, if not, set it to FREELANCER for LinkedIn signups
      if (!session.user.role) {
        await db.user.update({
          where: { id: session.user.id },
          data: { 
            role: UserRole.FREELANCER,
            emailVerified: new Date() // LinkedIn email is pre-verified
          }
        })
      }
      
      // Check if they have a freelancer profile
      const freelancerProfile = await db.freelancerProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (freelancerProfile) {
        // User exists and has freelancer profile, redirect to freelancer dashboard
        return NextResponse.redirect(new URL('/freelancer', request.url))
      } else {
        // User exists but no freelancer profile, needs to complete profile
        return NextResponse.redirect(new URL('/complete-freelancer-profile', request.url))
      }
    } else {
      // No session found, this might be a new user or authentication failed
      const { searchParams } = new URL(request.url)
      const error = searchParams.get('error')
      
      if (error) {
        console.error('LinkedIn authentication error:', error)
        return NextResponse.redirect(new URL('/?error=linkedin_auth_failed', request.url))
      }
      
      // If no error and no session, redirect to complete profile
      return NextResponse.redirect(new URL('/complete-freelancer-profile', request.url))
    }
  } catch (error) {
    console.error('LinkedIn callback error:', error)
    // Fallback to login page on error
    return NextResponse.redirect(new URL('/?error=callback_error', request.url))
  }
}