import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string, name: string }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'TEACHER') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const groups = await prisma.group.findMany({
    where: { teacherId: user.userId },
    include: {
      members: { include: { user: true } },
      sessions: { include: { attendances: true } }
    }
  })

  return Response.json(groups)
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'TEACHER') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { name, subject, level } = await req.json()
  if (!name) return Response.json({ error: 'El nombre es requerido' }, { status: 400 })

  const group = await prisma.group.create({
    data: { name, subject: subject || '', level: level || '', teacherId: user.userId }
  })

  return Response.json(group)
}