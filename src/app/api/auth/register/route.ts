import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password || username.length < 3 || password.length < 8) {
      return NextResponse.json({ error: 'Invalid username or password length (user 3+, pass 8+)' }, { status: 400 })
    }

    if (!/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one number and one symbol' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    })

    return NextResponse.json({ message: 'User registered successfully', userId: user.id }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
