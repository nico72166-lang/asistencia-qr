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
  if (!user || user.role !== 'STUDENT') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.userId },
    include: {
      group: {
        include: {
          sessions: { include: { attendances: { where: { studentId: user.userId } } } }
        }
      }
    }
  })

  const groups = memberships.map(m => {
    const total = m.group.sessions.length
    const present = m.group.sessions.filter(s => s.attendances.length > 0).length
    return {
      id: m.group.id,
      name: m.group.name,
      subject: m.group.subject,
      pct: total ? Math.round(present / total * 100) : 0
    }
  })

  return Response.json({ groups, name: user.name })
}
