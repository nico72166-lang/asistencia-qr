'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
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
          <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Elige tu rol para continuar</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('STUDENT')}
                className={`p-3 rounded-xl border text-center transition ${role === 'STUDENT' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-2xl mb-1">🎒</div>
                <div className="text-sm font-medium">Alumno</div>
              </button>
              <button type="button" onClick={() => setRole('TEACHER')}
                className={`p-3 rounded-xl border text-center transition ${role === 'TEACHER' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-2xl mb-1">🎓</div>
                <div className="text-sm font-medium">Docente</div>
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Tu nombre" required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres" required minLength={6}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-blue-600 underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
