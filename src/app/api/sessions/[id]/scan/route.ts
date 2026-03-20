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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req)
  if (!user || user.role !== 'TEACHER') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { qrToken } = await req.json()

  const qr = await prisma.qrToken.findUnique({
    where: { token: qrToken },
    include: { student: true }
  })

  if (!qr) return Response.json({ error: 'QR inválido' }, { status: 400 })
  if (qr.expiresAt < new Date()) return Response.json({ error: 'QR expirado' }, { status: 400 })

  const existing = await prisma.attendance.findUnique({
    where: { studentId_sessionId: { studentId: qr.studentId, sessionId: id } }
  })
  if (existing) return Response.json({ error: 'Ya registrado' }, { status: 400 })

  await prisma.attendance.create({
    data: { studentId: qr.studentId, sessionId: id, present: true }
  })

  return Response.json({ ok: true, student: qr.student.name })
}
