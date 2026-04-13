export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-aegis-key'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let currentUserPayload: any = null
    try {
      currentUserPayload = jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const previousLogins = await prisma.loginActivity.findMany({
      where: { username: currentUserPayload.username, success: true },
      orderBy: { timestamp: 'desc' },
      take: 2
    })
    
    // Use the 2nd most recent as the true "last login", fallback to 1st if it's a new account
    const lastLogin = previousLogins.length > 1 ? previousLogins[1] : previousLogins.length === 1 ? previousLogins[0] : null

    const totalUsers = await prisma.user.count()
    const totalLogins = await prisma.loginActivity.count()
    const failedLogins = await prisma.loginActivity.count({ where: { success: false } })
    
    const suspiciousActivities = await prisma.suspiciousActivity.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10
    })

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const loginsLast7Days = await prisma.loginActivity.findMany({
      where: { timestamp: { gte: sevenDaysAgo } },
      orderBy: { timestamp: 'asc' }
    })

    const chartDataMap: Record<string, { success: number, fail: number }> = {}
    
    for(let i=6; i>=0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      chartDataMap[dateStr] = { success: 0, fail: 0 }
    }

    loginsLast7Days.forEach((l: any) => {
      const d = l.timestamp.toISOString().split('T')[0]
      if (!chartDataMap[d]) chartDataMap[d] = { success: 0, fail: 0 }
      if (l.success) chartDataMap[d].success++
      else chartDataMap[d].fail++
    })

    const chartData = Object.keys(chartDataMap).map(k => ({
      date: k,
      ...chartDataMap[k]
    }))

    return NextResponse.json({
      totalUsers,
      totalLogins,
      failedLogins,
      suspiciousActivities,
      chartData,
      lastLogin
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
