export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span style={{ fontSize: '28px' }}>📋</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quickster</h1>
        <p className="text-gray-400 text-sm mb-6">Registro de asistencia por QR</p>
        <div className="flex gap-1.5 justify-center">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </main>
  )
}