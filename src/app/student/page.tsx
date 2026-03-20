'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'

export default function StudentPage() {
  const [qrToken, setQrToken] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(300)
  const [groups, setGroups] = useState<any[]>([])
  const [userName, setUserName] = useState('')
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
    setExpiresAt(new Date(data.expiresAt))
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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const urgent = timeLeft < 60

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{userName || 'Alumno'}</h1>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Alumno</span>
        </div>
        <button onClick={logout}
          className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          Salir
        </button>
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
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{g.name}</div>
                  <div className="text-xs text-gray-500">{g.subject}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  g.pct >= 80 ? 'bg-green-100 text-green-800' :
                  g.pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'}`}>
                  {g.pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
