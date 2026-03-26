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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req)
  if (!user || user.role !== 'STUDENT') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } }
      }
    }
  })

  if (!group) return Response.json({ error: 'Grupo no encontrado' }, { status: 404 })

  return Response.json({
    id: group.id,
    name: group.name,
    subject: group.subject,
    teacher: group.teacher,
    members: group.members.map(m => ({
      id: m.userId,
      name: m.user.name,
      avatar: m.user.avatar,
      isMe: m.userId === user.userId
    }))
  })
}