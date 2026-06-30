'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    router.push('/calendario')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #002d6b 0%, #004c9e 60%, #0068cc 100%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-white font-black text-2xl tracking-tight">CCB</span>
          </div>
          <h1 className="text-white font-bold text-xl">Calendario de Gestión</h1>
          <p className="text-white/60 text-sm mt-1">Cámara de Comercio de Barranquilla</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-2xl"
          style={{ borderRadius: '12px' }}
        >
          <h2 className="text-[#1a1a2e] font-bold text-lg mb-5">Iniciar sesión</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-600 text-[#5d6d7e] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="usuario@ccb.org.co"
                className="w-full px-3 py-2.5 border border-[#d0dce9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-[#5d6d7e] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-[#d0dce9] rounded-lg text-sm text-[#1a1a2e] placeholder-[#a0aec0] focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-sm text-[#e74c3c] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-60 cursor-pointer"
              style={{ background: '#004c9e' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
