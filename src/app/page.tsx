import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getSession()
  if (session?.role === 'TEACHER') redirect('/teacher')
  if (session?.role === 'STUDENT') redirect('/student')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            📋
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">AsistenciaQR</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de asistencia por código QR</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <Link href="/auth/login"
            className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
            Iniciar sesión
          </Link>
          <Link href="/auth/register"
            className="block w-full bg-gray-100 text-gray-800 text-center py-2.5 rounded-xl font-medium hover:bg-gray-200 transition">
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  )
}