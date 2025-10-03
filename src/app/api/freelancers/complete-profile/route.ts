import { NextResponse } from "next/server"
import { authClient } from "@/components/providers"
import { db } from "@/lib/db"
import { UserRole, TrainerType } from "@prisma/client"

export async function POST(request: Request) {
  try {
    // Get the session using authClient
    const session = await authClient.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      skills,
      experience,
      bio,
      location,
      trainerType
    } = body

    // Parse skills from JSON string
    const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills

    // Update user with LinkedIn data
    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
        role: UserRole.FREELANCER
      }
    })

    // Check if freelancer profile already exists
    const existingProfile = await db.freelancerProfile.findUnique({
      where: { userId: session.user.id }
    })

    let freelancerProfile
    if (existingProfile) {
      // Update existing profile
      freelancerProfile = await db.freelancerProfile.update({
        where: { userId: session.user.id },
        data: {
          name,
          email,
          phone,
          skills: JSON.stringify(parsedSkills),
          experience,
          bio,
          location,
          trainerType: trainerType as TrainerType,
          availability: "AVAILABLE"
        }
      })
    } else {
      // Create new freelancer profile
      freelancerProfile = await db.freelancerProfile.create({
        data: {
          userId: user.id,
          name,
          email,
          phone,
          skills: JSON.stringify(parsedSkills),
          experience,
          bio,
          location,
          trainerType: trainerType as TrainerType,
          availability: "AVAILABLE"
        }
      })
    }

    return NextResponse.json({
      success: true,
      user,
      freelancerProfile
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}