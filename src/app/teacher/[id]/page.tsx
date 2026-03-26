'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

function SessionCard({ session, groupId }: { session: any, groupId: string }) {
  const [open, setOpen] = useState(false)

  async function exportExcel() {
    const { utils, writeFile } = await import('xlsx')
    
    const res = await fetch(`/api/groups/${groupId}`)
    const group = await res.json()
    
    const rows = group.members.map((m: any) => {
      const asistio = session.attendances.some((a: any) => a.studentId === m.userId)
      return {
        Nombre: m.user.name,
        Correo: m.user.email,
        Fecha: new Date(session.date).toLocaleDateString('es-MX'),
        Estado: asistio ? 'Presente' : 'Ausente'
      }
    })

    rows.sort((a: any, b: any) => {
      if (a.Estado.includes('Presente') && b.Estado.includes('Ausente')) return -1
      if (a.Estado.includes('Ausente') && b.Estado.includes('Presente')) return 1
      return a.Nombre.localeCompare(b.Nombre)
    })

    const ws = utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 }]
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Asistencia')
    writeFile(wb, `asistencia-${new Date(session.date).toLocaleDateString('es-MX').replace(/\//g, '-')}.xlsx`)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setOpen(!open)}>
        <div className="text-sm text-gray-900">
          {new Date(session.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {session.attendances.length} presentes
          </span>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-100 p-3">
          {session.attendances.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-2">Nadie asistió esta sesión</p>
          ) : (
            <div className="space-y-2 mb-3">
              {session.attendances.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span className="font-medium text-gray-900">{a.student.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{a.student.email}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={exportExcel}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-2">
            📊 Exportar a Excel
          </button>
        </div>
      )}
    </div>
  )
}

export default function GroupPage() {
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
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
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {group.subject}{group.level ? ` · ${group.level}` : ''}
            </p>
          </div>
          <Link href="/teacher"
            className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
            ← Volver
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">{group.members.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Alumnos</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">{group.sessions.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Sesiones</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">
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
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedAvatar(m.user.avatar || null)}
                        className="flex-shrink-0">
                        {m.user.avatar ? (
                          <img src={m.user.avatar} alt={m.user.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {m.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{m.user.name}</div>
                        <div className="text-xs text-gray-500">{m.user.email}</div>
                      </div>
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
            <div className="space-y-3">
              {[...group.sessions].reverse().map((s: any) => (
                <SessionCard key={s.id} session={s} groupId={id} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal foto grande */}
      {selectedAvatar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAvatar(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={selectedAvatar} alt="Foto"
              className="w-72 h-72 rounded-2xl object-cover border-4 border-white" />
            <button onClick={() => setSelectedAvatar(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-700 font-bold border border-gray-200">
              ✕
            </button>
          </div>
        </div>
      )}

    </main>
  )
}
