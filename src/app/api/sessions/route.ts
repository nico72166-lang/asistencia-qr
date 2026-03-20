import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'TEACHER') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { groupId } = await req.json()

  const session = await prisma.session.create({
    data: { groupId }
  })

  return Response.json(session)
}