'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    const res = await fetch('/api/profile')
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setUser(data)
    setName(data.name)
    setEmail(data.email)
    setLoading(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 5MB')
      return
    }

    setUploadingAvatar(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    setUploadingAvatar(false)

    if (!res.ok) { setError(data.error); return }

    setUser((prev: any) => ({ ...prev, avatar: data.avatar }))
    setSuccess('¡Foto actualizada!')
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleRemoveAvatar() {
    if (!confirm('¿Eliminar tu foto de perfil?')) return
    setUploadingAvatar(true)
    await fetch('/api/profile/avatar', { method: 'DELETE' })
    setUser((prev: any) => ({ ...prev, avatar: null }))
    setUploadingAvatar(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const body: any = { name, email }
    if (showPasswordForm && newPassword) {
      body.currentPassword = currentPassword
      body.newPassword = newPassword
    }

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error); return }

    setSuccess('¡Perfil actualizado correctamente!')
    setCurrentPassword('')
    setNewPassword('')
    setShowPasswordForm(false)
    fetchProfile()
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </main>
  )

  const backUrl = user?.role === 'TEACHER' ? '/teacher' : '/student'
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Mi perfil</h1>
          <Link href={backUrl}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
            ← Volver
          </Link>
        </div>

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">{initials}</span>
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="font-medium text-gray-900">{user?.name}</div>
          <div className="text-sm text-gray-500 mt-0.5">{user?.email}</div>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 font-medium ${
            user?.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {user?.role === 'TEACHER' ? 'Docente' : 'Alumno'}
          </span>
          <div className="text-xs text-gray-400 mt-2">
            Miembro desde {new Date(user?.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </div>

          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
              {user?.avatar ? '📷 Cambiar foto' : '📷 Subir foto'}
            </button>
            {user?.avatar && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploadingAvatar}
                className="text-sm bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50">
                🗑 Eliminar
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {success && (
          <div className="bg-green-100 text-green-800 rounded-xl p-3 mb-4 text-sm text-center font-medium">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 rounded-xl p-3 mb-4 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"
                style={{ fontSize: '16px' }} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"
                style={{ fontSize: '16px' }} />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button type="button"
                onClick={() => { setShowPasswordForm(!showPasswordForm); setError('') }}
                className="text-sm text-blue-600 font-medium">
                {showPasswordForm ? '— Cancelar cambio de contraseña' : '🔑 Cambiar contraseña'}
              </button>

              {showPasswordForm && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Contraseña actual</label>
                    <input type="password" value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"
                      style={{ fontSize: '16px' }} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nueva contraseña</label>
                    <input type="password" value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"
                      style={{ fontSize: '16px' }} />
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}