'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from './ProfileProvider'
import { getDepartmentColor, getDepartmentName } from '@/lib/departments'
import type { Task } from '@/lib/types'

interface Props {
  task?: Task | null
  onClose: () => void
  onSaved: () => void
}

const EMPTY_FORM = {
  title: '',
  description: '',
  responsible: '',
  start_date: '',
  due_date: '',
  progress: 0,
  status: 'pending',
}

export function TaskModal({ task, onClose, onSaved }: Props) {
  const profile = useProfile()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        responsible: task.responsible,
        start_date: task.start_date ?? '',
        due_date: task.due_date,
        progress: task.progress,
        status: task.status,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [task])

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const supabase = createClient()
    const payload = {
      ...form,
      department: profile.department,
      start_date: form.start_date || null,
      progress: Number(form.progress),
    }

    const { error: dbError } = task
      ? await supabase.from('tasks').update(payload).eq('id', task.id)
      : await supabase.from('tasks').insert(payload)

    if (dbError) {
      setError(dbError.message)
      setSaving(false)
      return
    }

    onSaved()
    onClose()
  }

  const deptColor = getDepartmentColor(profile.department)
  const isEditing = !!task

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: '#f7f9fc', borderBottom: '1px solid #e2e8f0' }}
        >
          <h2 className="font-bold text-[#1a1a2e] text-base">
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#5d6d7e] hover:text-[#1a1a2e] text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Department badge (readonly) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5d6d7e] uppercase tracking-widest">
              Departamento
            </span>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: deptColor }}
            >
              {getDepartmentName(profile.department)}
            </span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#5d6d7e] mb-1">
              Título <span className="text-[#e74c3c]">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              maxLength={255}
              placeholder="Nombre de la tarea"
              className="w-full px-3 py-2 border border-[#d0dce9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#5d6d7e] mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="Descripción opcional"
              className="w-full px-3 py-2 border border-[#d0dce9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent resize-none"
            />
          </div>

          {/* Responsible */}
          <div>
            <label className="block text-sm font-semibold text-[#5d6d7e] mb-1">
              Responsable <span className="text-[#e74c3c]">*</span>
            </label>
            <input
              type="text"
              value={form.responsible}
              onChange={(e) => set('responsible', e.target.value)}
              required
              placeholder="Nombre del responsable"
              className="w-full px-3 py-2 border border-[#d0dce9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#5d6d7e] mb-1">Fecha inicio</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-[#d0dce9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5d6d7e] mb-1">
                Fecha límite <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#d0dce9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004c9e] focus:border-transparent"
              />
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-semibold text-[#5d6d7e] mb-2">
              Progreso: <span className="font-bold text-[#004c9e]">{form.progress}%</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => set('progress', Number(e.target.value))}
                className="flex-1 accent-[#004c9e]"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) =>
                  set('progress', Math.min(100, Math.max(0, Number(e.target.value))))
                }
                className="w-16 px-2 py-1 border border-[#d0dce9] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#004c9e]"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-[#5d6d7e] mb-1">Estado</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-3 py-2 border border-[#d0dce9] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004c9e] bg-white"
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="overdue">Vencido</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-[#e74c3c] bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[#d0dce9] text-sm font-semibold text-[#5d6d7e] hover:bg-[#f7f9fc] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ background: '#004c9e' }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
