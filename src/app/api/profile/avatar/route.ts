import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function getUser(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const session = getUser(req)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return Response.json({ error: 'No se envió archivo' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'quickster/avatars',
        public_id: `avatar-${session.userId}`,
        overwrite: true,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' }
        ]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatar: result.secure_url }
  })

  return Response.json({ avatar: result.secure_url })
}

export async function DELETE(req: NextRequest) {
  const session = getUser(req)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  await cloudinary.uploader.destroy(`quickster/avatars/avatar-${session.userId}`)

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatar: null }
  })

  return Response.json({ ok: true })
}