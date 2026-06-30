'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from './ProfileProvider'
import { DEPARTMENTS, getDepartmentColor, getDepartmentName } from '@/lib/departments'
import { getEffectiveStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { TaskModal } from './TaskModal'
import type { Task } from '@/lib/types'

interface Props {
  tasks: Task[]
  onRefresh: () => void
}

export function TaskTable({ tasks, onRefresh }: Props) {
  const profile = useProfile()
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const filtered = tasks.filter((t) => {
    if (deptFilter && t.department !== deptFilter) return false
    if (statusFilter && getEffectiveStatus(t) !== statusFilter) return false
    return true
  })

  async function handleDelete(task: Task) {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return
    setDeleting(task.id)
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', task.id)
    onRefresh()
    setDeleting(null)
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 border border-[#d0dce9] rounded-lg text-sm bg-white text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#004c9e]"
        >
          <option value="">Todos los departamentos</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#d0dce9] rounded-lg text-sm bg-white text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#004c9e]"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f7f9fc', borderBottom: '1px solid #e2e8f0' }}>
              {['Tarea', 'Departamento', 'Responsable', 'Fecha límite', 'Progreso', 'Estado', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-[#5d6d7e] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#5d6d7e] text-sm">
                  No hay tareas que coincidan con los filtros.
                </td>
              </tr>
            )}
            {filtered.map((task, i) => {
              const status = getEffectiveStatus(task)
              const isOwn = task.department === profile.department
              return (
                <tr
                  key={task.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f0f4f9' : 'none' }}
                >
                  <td className="px-4 py-3 font-semibold text-[#1a1a2e] max-w-[180px]">
                    <span className="truncate block" title={task.title}>
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-xs text-[#5d6d7e] truncate block" title={task.description}>
                        {task.description}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ background: getDepartmentColor(task.department) }}
                    >
                      {getDepartmentName(task.department)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5d6d7e]">{task.responsible}</td>
                  <td className="px-4 py-3 text-[#5d6d7e] tabular-nums whitespace-nowrap">
                    {task.due_date}
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#e2e8f0] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${task.progress}%`,
                            background: task.progress === 100 ? '#2D8A4E' : '#004c9e',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#5d6d7e] tabular-nums w-8 text-right">
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: STATUS_COLORS[status] ?? '#64748b' }}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isOwn && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditTask(task)}
                          className="text-xs text-[#004c9e] hover:underline font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(task)}
                          disabled={deleting === task.id}
                          className="text-xs text-[#e74c3c] hover:underline font-semibold disabled:opacity-40"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editTask && (
        <TaskModal task={editTask} onClose={() => setEditTask(null)} onSaved={onRefresh} />
      )}
    </>
  )
}
