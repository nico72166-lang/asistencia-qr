'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import ThemeToggle from '@/components/ThemeToggle'

export default function StudentPage() {
  const [qrToken, setQrToken] = useState('')
  const [timeLeft, setTimeLeft] = useState(300)
  const [groups, setGroups] = useState<any[]>([])
  const [userName, setUserName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [loadingGroup, setLoadingGroup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchQR()
    fetchGroups()
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { fetchQR(); return 300 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function fetchQR() {
    const res = await fetch('/api/student/qr')
    if (res.status === 401) { router.push('/'); return }
    const data = await res.json()
    setQrToken(data.token)
    const secs = Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
    setTimeLeft(Math.min(secs, 300))
  }

  async function fetchGroups() {
    const res = await fetch('/api/student/groups')
    if (res.ok) {
      const data = await res.json()
      setGroups(data.groups)
      setUserName(data.name)
    }
  }

async function openGroup(groupId: string | null) {
  if (!groupId) { setSelectedGroup(null); return }
  setLoadingGroup(true)
  setSelectedGroup({ id: groupId })
  const res = await fetch(`/api/student/groups/${groupId}`)
  const data = await res.json()
  setSelectedGroup(data)
  setLoadingGroup(false)
}

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const urgent = timeLeft < 60

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{userName || 'Alumno'}</h1>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Alumno</span>
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

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-medium text-gray-500 mb-4 text-center">Tu código QR de asistencia</h2>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white border border-gray-200 rounded-xl">
              {qrToken ? (
                <QRCode value={qrToken} size={180} />
              ) : (
                <div className="w-44 h-44 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Generando...</p>
                </div>
              )}
            </div>
          </div>
          <div className={`text-center text-4xl font-semibold tabular-nums mb-2 ${urgent ? 'text-red-500' : 'text-green-600'}`}>
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <div className={`text-center text-xs px-3 py-1 rounded-full inline-block w-full ${urgent ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {urgent ? '⚠️ QR expira pronto' : '✅ QR activo'}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Se renueva automáticamente cada 5 minutos
          </p>
        </div>
        <div>
  <h2 className="text-sm font-medium text-gray-500 mb-3">Mis grupos</h2>
  {groups.length === 0 ? (
    <div className="text-center py-8 text-gray-400 text-sm">
      Aún no estás inscrito en ningún grupo
    </div>
  ) : (
    <div className="space-y-2">
      {groups.map((g: any) => (
        <div key={g.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => openGroup(g.id === selectedGroup?.id ? null : g.id)}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition text-left">
            <div>
              <div className="text-sm font-medium text-gray-900">{g.name}</div>
              <div className="text-xs text-gray-500">{g.subject}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                g.pct >= 80 ? 'bg-green-100 text-green-800' :
                g.pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'}`}>
                {g.pct}%
              </span>
              <span className="text-gray-400 text-xs">
                {selectedGroup?.id === g.id ? '▲' : '▼'}
              </span>
            </div>
          </button>

          {selectedGroup?.id === g.id && (
            <div className="border-t border-gray-100 p-3">
              {loadingGroup ? (
                <p className="text-gray-400 text-sm text-center py-4">Cargando...</p>
              ) : (
                <>                  
                  {/* Profesor */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Profesor</p>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                      <button onClick={() => selectedGroup.teacher.avatar && setSelectedAvatar(selectedGroup.teacher.avatar)}
                        className="flex-shrink-0">
                        {selectedGroup.teacher.avatar ? (
                          <img src={selectedGroup.teacher.avatar} alt={selectedGroup.teacher.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {selectedGroup.teacher.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{selectedGroup.teacher.name}</div>
                        <div className="text-xs text-blue-600">Profesor</div>
                      </div>
                    </div>
                  </div>
                      
                  {/* Compañeros */}
                  <p className="text-xs text-gray-400 mb-2">
                    {selectedGroup.members.length} compañeros en este grupo
                  </p>
                  <div className="space-y-2">
                    {selectedGroup.members.map((m: any) => (
                      <div key={m.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${
                        m.isMe ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                        <button onClick={() => m.avatar && setSelectedAvatar(m.avatar)}
                          className="flex-shrink-0">
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 hover:opacity-80 transition" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{m.name}</div>
                          {m.isMe && <div className="text-xs text-blue-600">Tú</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>             
              )}
            </div>
          )}
        </div>
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
