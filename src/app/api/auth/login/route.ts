import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-aegis-key'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const recentFailuresForUser = await prisma.loginActivity.count({
      where: {
        username,
        success: false,
        timestamp: { gte: new Date(Date.now() - 15 * 60 * 1000) }
      }
    })

    if (recentFailuresForUser >= 5) {
      return NextResponse.json({ error: 'Account temporarily locked due to multiple failed login attempts. Please try again later.' }, { status: 403 })
    }

    const checkSuspicious = await prisma.loginActivity.count({
      where: {
        ipAddress,
        success: false,
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    })

    if (checkSuspicious >= 5) {
      await prisma.suspiciousActivity.create({
        data: {
          description: `Multiple failed login attempts from IP`,
          severity: 'HIGH',
          ipAddress
        }
      })
    }

    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      await prisma.loginActivity.create({
        data: { username, ipAddress, success: false }
      })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      await prisma.loginActivity.create({
        data: { username, ipAddress, success: false }
      })

      const recentFailuresForUser = await prisma.loginActivity.count({
        where: {
          username,
          success: false,
          timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) }
        }
      })
      
      if (recentFailuresForUser >= 5) {
        await prisma.suspiciousActivity.create({
          data: {
            description: `Targeted brute-force against user: ${username}`,
            severity: 'CRITICAL',
            ipAddress
          }
        })
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await prisma.loginActivity.create({
      data: { username, ipAddress, success: true }
    })

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' })
    
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    })

    return NextResponse.json({ message: 'Logged in successfully', username: user.username })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
