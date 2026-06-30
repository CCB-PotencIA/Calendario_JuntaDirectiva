import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Calendario de Gestión — CCB',
  description: 'Sistema de gestión de tareas por departamento — Cámara de Comercio de Barranquilla',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
