'use client'
import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScanPage() {
  const [scanned, setScanned] = useState<{name:string, time:string}[]>([])
  const [lastScan, setLastScan] = useState<{name:string, ok:boolean, msg:string} | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const groupId = params.id as string
  const sessionId = searchParams.get('sessionId') as string
  const scannedTokens = new Set<string>()

  async function handleScan(result: any) {
    const token = result[0]?.rawValue
    if (!token || scannedTokens.has(token)) return
    scannedTokens.add(token)

    const res = await fetch(`/api/sessions/${sessionId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken: token })
    })
    const data = await res.json()
    const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

    if (res.ok) {
      setScanned(prev => [{ name: data.student, time }, ...prev])
      setLastScan({ name: data.student, ok: true, msg: 'Asistencia registrada' })
    } else {
      setLastScan({ name: data.error, ok: false, msg: data.error })
      scannedTokens.delete(token)
    }
    setTimeout(() => setLastScan(null), 3000)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4 pt-4">
        <h1 className="text-xl font-semibold text-gray-900">Tomar asistencia</h1>
        <Link href={`/teacher/${groupId}`}
          className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          ← Volver
        </Link>
      </div>

      {lastScan && (
        <div className={`rounded-xl p-4 mb-4 text-center font-medium text-sm ${
          lastScan.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {lastScan.ok ? '✅' : '❌'} {lastScan.ok ? lastScan.name + ' — Asistencia registrada' : lastScan.msg}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 rounded-xl p-4 mb-4 text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
        {!scanning ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">📷</div>
            <p className="text-gray-500 text-sm mb-5">
              Activa la cámara para escanear los QR de tus alumnos
            </p>
            <button onClick={() => setScanning(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
              Activar cámara
            </button>
          </div>
        ) : (
          <div className="relative">
            <Scanner
              onScan={handleScan}
              onError={(e) => setError('Error de cámara: ' + e)}
              constraints={{ facingMode: 'environment' }}
              styles={{ container: { width: '100%', height: '320px' } }}
            />
            <button onClick={() => setScanning(false)}
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-3 py-1.5 rounded-lg z-10">
              Detener
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          Presentes esta sesión ({scanned.length})
        </h2>
        {scanned.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Ninguno aún</p>
        ) : (
          <div className="space-y-2">
            {scanned.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span className="text-gray-900 font-medium">{s.name}</span>
                </div>
                <span className="text-gray-400 text-xs">{s.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => router.push(`/teacher/${groupId}`)}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition">
        Finalizar sesión
      </button>
    </main>
  )
}
