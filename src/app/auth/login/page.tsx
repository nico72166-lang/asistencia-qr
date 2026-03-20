'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error); return }

    if (data.user.role === 'TEACHER') router.push('/teacher')
    else router.push('/student')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            📋
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-1">Bienvenido de vuelta</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com" required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-blue-600 underline">Crear cuenta</Link>
          </p>
        </div>
      </div>
    </main>
  )
}