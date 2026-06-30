import type { Task } from './types'

export function getEffectiveStatus(task: Task): string {
  if (task.progress === 100) return 'completed'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.due_date + 'T00:00:00')
  if (due < today) return 'overdue'
  if (task.progress > 0) return 'in_progress'
  return 'pending'
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  overdue: 'Vencido',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: '#64748b',
  in_progress: '#004c9e',
  completed: '#2D8A4E',
  overdue: '#e74c3c',
}
