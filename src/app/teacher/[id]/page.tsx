'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function GroupPage() {
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => { fetchGroup() }, [])

  async function fetchGroup() {
    const res = await fetch(`/api/groups/${id}`)
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setGroup(data)
    setLoading(false)
  }

  async function startSession() {
    setStarting(true)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: id })
    })
    const session = await res.json()
    router.push(`/teacher/${id}/scan?sessionId=${session.id}`)
  }

  function getPct(studentId: string) {
    if (!group.sessions.length) return 0
    const present = group.sessions.filter((s: any) =>
      s.attendances.some((a: any) => a.studentId === studentId)
    ).length
    return Math.round(present / group.sessions.length * 100)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{group.subject} {group.level ? `· ${group.level}` : ''}</p>
        </div>
        <Link href="/teacher"
          className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-semibold">{group.members.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Alumnos</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-semibold">{group.sessions.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Sesiones</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-semibold">
            {group.sessions.length && group.members.length ? Math.round(
              group.sessions.reduce((a: number, s: any) => a + s.attendances.length, 0) /
              (group.sessions.length * group.members.length) * 100
            ) : 0}%
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Asistencia</div>
        </div>
      </div>

      <button onClick={startSession} disabled={starting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 mb-6">
        {starting ? 'Iniciando...' : '📷 Iniciar sesión de clase'}
      </button>

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Alumnos inscritos</h2>
        {group.members.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Los alumnos aparecen aquí cuando escanean su QR
          </div>
        ) : (
          <div className="space-y-2">
            {group.members.map((m: any) => {
              const pct = getPct(m.userId)
              return (
                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{m.user.name}</div>
                    <div className="text-xs text-gray-500">{m.user.email}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    pct >= 80 ? 'bg-green-100 text-green-800' :
                    pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">Historial de sesiones</h2>
        {group.sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Sin sesiones aún</div>
        ) : (
          <div className="space-y-2">
            {[...group.sessions].reverse().map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                <div className="text-sm text-gray-900">
                  {new Date(s.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {s.attendances.length} presentes
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
