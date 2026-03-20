'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ScanPage() {
  const [scanned, setScanned] = useState<string[]>([])
  const [lastScan, setLastScan] = useState<{ name: string, ok: boolean, msg: string } | null>(null)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<any>(null)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const groupId = params.id as string
  const sessionId = searchParams.get('sessionId') as string

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.clear()
    }
  }, [])

  async function startScanner() {
    setScanning(true)
    const { Html5QrcodeScanner } = await import('html5-qrcode')
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )
    scannerRef.current.render(
      async (token: string) => {
        const res = await fetch(`/api/sessions/${sessionId}/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrToken: token })
        })
        const data = await res.json()
        if (res.ok) {
          setScanned(prev => [...prev, data.student])
          setLastScan({ name: data.student, ok: true, msg: 'Asistencia registrada' })
        } else {
          setLastScan({ name: data.error, ok: false, msg: data.error })
        }
        setTimeout(() => setLastScan(null), 3000)
      },
      (error: any) => {}
    )
  }

  async function finishSession() {
    router.push(`/teacher/${groupId}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <h1 className="text-xl font-semibold text-gray-900">Tomar asistencia</h1>
        <Link href={`/teacher/${groupId}`}
          className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          ← Volver
        </Link>
      </div>

      {lastScan && (
        <div className={`rounded-xl p-4 mb-4 text-center font-medium ${
          lastScan.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {lastScan.ok ? '✅' : '❌'} {lastScan.ok ? lastScan.name : lastScan.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        {!scanning ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📷</div>
            <p className="text-gray-500 text-sm mb-4">
              Activa la cámara para escanear los QR de tus alumnos
            </p>
            <button onClick={startScanner}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">
              Activar cámara
            </button>
          </div>
        ) : (
          <div id="qr-reader" className="w-full" />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          Presentes esta sesión ({scanned.length})
        </h2>
        {scanned.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Ninguno aún</p>
        ) : (
          <div className="space-y-2">
            {scanned.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✅</span>
                <span className="text-gray-900">{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={finishSession}
        className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition">
        Finalizar sesión
      </button>
    </main>
  )
}