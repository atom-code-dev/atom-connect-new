import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total counts
    const [
      totalUsers,
      totalOrganizations,
      totalFreelancers,
      totalMaintainers,
      totalTrainings,
      activeTrainings
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: UserRole.ORGANIZATION } }),
      db.user.count({ where: { role: UserRole.FREELANCER } }),
      db.user.count({ where: { role: UserRole.MAINTAINER } }),
      db.training.count(),
      db.training.count({ 
        where: { 
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      })
    ])

    const pendingVerificationsCount = await db.organizationProfile.count({ 
      where: { verifiedStatus: 'PENDING' }
    }) + await db.freelancerProfile.count({ 
      where: { availability: 'NOT_AVAILABLE' }
    })

    // Get recent activities
    const recentActivities = await db.user.findMany({
      where: {
        OR: [
          { role: UserRole.FREELANCER },
          { role: UserRole.ORGANIZATION }
        ]
      },
      include: {
        freelancerProfile: true,
        organizationProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const activities = recentActivities.map(user => ({
      id: user.id,
      type: user.role?.toLowerCase() || 'user',
      action: user.role === UserRole.FREELANCER ? 'New freelancer registered' : 'New organization registered',
      time: user.createdAt.toLocaleString(),
      userName: user.name || user.email
    }))

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrganizations,
        totalFreelancers,
        totalMaintainers,
        totalTrainings,
        activeTrainings,
        pendingVerifications: pendingVerificationsCount
      },
      recentActivities: activities
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}