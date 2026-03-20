import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'STUDENT') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.qrToken.upsert({
    where: { studentId: user.userId },
    update: { token, expiresAt },
    create: { token, expiresAt, studentId: user.userId }
  })

  return Response.json({ token, expiresAt })
}