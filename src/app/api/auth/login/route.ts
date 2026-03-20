import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const response = Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })

    response.headers.set('Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
    )

    return response
  } catch (error) {
    return Response.json({ error: 'Error del servidor' }, { status: 500 })
  }
}