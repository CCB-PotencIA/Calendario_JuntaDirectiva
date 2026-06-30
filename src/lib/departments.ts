import type { Department } from './types'

export const DEPARTMENTS: Department[] = [
  { slug: 'secretaria', name: 'Secretaría General', color: '#004c9e' },
  { slug: 'conexiones', name: 'Conexiones', color: '#009de2' },
  { slug: 'control_interno', name: 'Control Interno', color: '#e74c3c' },
  { slug: 'comunicaciones', name: 'Comunicaciones', color: '#f39c12' },
  { slug: 'financiera', name: 'Financiera', color: '#2ecc71' },
  { slug: 'administrativa', name: 'Administrativa', color: '#9b59b6' },
  { slug: 'compras', name: 'Compras', color: '#1abc9c' },
  { slug: 'vp_registro_td', name: 'VP Registro y TD', color: '#e67e22' },
]

export function getDepartment(slug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug)
}

export function getDepartmentColor(slug: string): string {
  return getDepartment(slug)?.color ?? '#64748b'
}

export function getDepartmentName(slug: string): string {
  return getDepartment(slug)?.name ?? slug
}
