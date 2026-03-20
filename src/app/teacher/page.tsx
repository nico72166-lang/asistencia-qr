'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function TeacherPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    const res = await fetch('/api/groups')
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setGroups(data)
    setLoading(false)
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subject, level })
    })
    setName(''); setSubject(''); setLevel('')
    setShowForm(false); setCreating(false)
    fetchGroups()
  }

  async function deleteGroup(id: string, groupName: string) {
    if (!confirm(`¿Eliminar "${groupName}"? Se borrarán todas sus sesiones y asistencias.`)) return
    setDeletingId(id)
    await fetch(`/api/groups/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchGroups()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function getPct(group: any) {
    const total = group.members.length * group.sessions.length
    if (!total) return 0
    const present = group.sessions.reduce((a: number, s: any) => a + s.attendances.length, 0)
    return Math.round(present / total * 100)
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
            <h1 className="text-xl font-semibold text-gray-900">Mis grupos</h1>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Docente</span>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Link href="/profile"
              className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
              👤 Perfil
            </Link>
            <button onClick={logout}
              className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
              Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">{groups.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Grupos</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {[...new Set(groups.flatMap(g => g.members.map((m: any) => m.userId)))].length}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Alumnos</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {groups.reduce((a, g) => a + g.sessions.length, 0)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Sesiones</div>
          </div>
        </div>

        <button onClick={() => setShowForm(!showForm)}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition mb-4">
          {showForm ? 'Cancelar' : '+ Nuevo grupo'}
        </button>

        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <form onSubmit={createGroup} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre del grupo *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej: Matemáticas 3°A" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"/>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Materia</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Ej: Álgebra lineal"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"/>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Carrera / Nivel</label>
                <input value={level} onChange={e => setLevel(e.target.value)}
                  placeholder="Ej: Ingeniería en Sistemas"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-gray-900"/>
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium disabled:opacity-50">
                {creating ? 'Creando...' : 'Crear grupo'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {groups.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No tienes grupos aún. Crea uno.
            </div>
          )}
          {groups.map(g => {
            const pct = getPct(g)
            return (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/teacher/${g.id}`} className="flex-1">
                    <div className="font-medium text-gray-900">{g.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {g.subject} · {g.members.length} alumnos · {g.sessions.length} sesiones
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      pct >= 80 ? 'bg-green-100 text-green-800' :
                      pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                      {pct}%
                    </span>
                    <button
                      onClick={() => deleteGroup(g.id, g.name)}
                      disabled={deletingId === g.id}
                      className="text-red-400 hover:text-red-600 text-lg leading-none disabled:opacity-50"
                      title="Eliminar grupo">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}