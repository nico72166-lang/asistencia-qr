import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string, name: string }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const session = getUser(req)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

const user = await prisma.user.findUnique({
  where: { id: session.userId },
  select: { id: true, name: true, email: true, role: true, createdAt: true, avatar: true }
})

  return Response.json(user)
}

export async function PUT(req: NextRequest) {
  const session = getUser(req)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { name, email, currentPassword, newPassword } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 })

  // Si quiere cambiar contraseña, verificar la actual
  if (newPassword) {
    if (!currentPassword) {
      return Response.json({ error: 'Ingresa tu contraseña actual' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return Response.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return Response.json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }
  }

  // Verificar que el email no esté en uso por otro usuario
  if (email !== user.email) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return Response.json({ error: 'Ese correo ya está en uso' }, { status: 400 })
  }

  const updateData: any = { name, email }
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

  await prisma.user.update({ where: { id: session.userId }, data: updateData })

  return Response.json({ ok: true })
}
