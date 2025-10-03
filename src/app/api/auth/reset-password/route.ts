import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'
import { z } from 'zod'

// Reset password schema
const ResetPasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        message: 'Authentication required',
        success: false
      }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = ResetPasswordSchema.parse(body)

    // Find user by email
    const userRecord = await db.user.findUnique({
      where: {
        email: session.user.email
      }
    })

    if (!userRecord || !userRecord.password) {
      return NextResponse.json({
        message: 'User not found or no password set',
        success: false
      }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, userRecord.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        message: 'Current password is incorrect',
        success: false
      }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // Update user password
    await db.user.update({
      where: { id: userRecord.id },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({
      message: 'Password has been reset successfully',
      success: true
    })

  } catch (error) {
    console.error('Password reset error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Validation error',
        errors: error.issues,
        success: false
      }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}