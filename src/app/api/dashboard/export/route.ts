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
      return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (e) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const activities = await prisma.suspiciousActivity.findMany({
      orderBy: { timestamp: 'desc' },
      take: 1000
    })

    const csvRows = [
      ['ID', 'Timestamp', 'IP Address', 'Severity', 'Description'].join(',')
    ]

    for (const a of activities) {
      const row = [
        a.id,
        a.timestamp.toISOString(),
        a.ipAddress || 'Unknown',
        a.severity,
        `"${a.description.replace(/"/g, '""')}"` 
      ]
      csvRows.push(row.join(','))
    }

    const csvData = csvRows.join('\n')

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="aegisweb-security-logs.csv"'
      }
    })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
