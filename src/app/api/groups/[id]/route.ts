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
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      sessions: { include: { attendances: true } }
    }
  })

  return Response.json(group)
}