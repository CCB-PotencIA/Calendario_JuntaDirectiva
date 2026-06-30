'use client'

import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from './ProfileProvider'
import { getDepartmentColor, getDepartmentName } from '@/lib/departments'
import { getEffectiveStatus, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { TaskModal } from './TaskModal'
import type { Task } from '@/lib/types'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { es },
})

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: Task
}

interface Props {
  tasks: Task[]
  onRefresh: () => void
}

export function TaskCalendar({ tasks, onRefresh }: Props) {
  const profile = useProfile()
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const events = useMemo<CalendarEvent[]>(
    () =>
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        start: t.start_date ? new Date(t.start_date + 'T00:00:00') : new Date(t.due_date + 'T00:00:00'),
        end: new Date(t.due_date + 'T23:59:59'),
        resource: t,
      })),
    [tasks]
  )

  function eventStyleGetter(event: CalendarEvent) {
    const color = getDepartmentColor(event.resource.department)
    return {
      style: {
        background: color,
        border: 'none',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 6px',
      },
    }
  }

  async function handleDeleteDetail() {
    if (!detailTask) return
    if (!confirm(`¿Eliminar "${detailTask.title}"?`)) return
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', detailTask.id)
    setDetailTask(null)
    onRefresh()
  }

  const isOwnDetail = detailTask?.department === profile.department
  const detailStatus = detailTask ? getEffectiveStatus(detailTask) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1a1a2e] text-base">Vista de calendario</h2>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: '#004c9e' }}
        >
          <span className="text-lg leading-none">+</span>
          Nueva tarea
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={(v) => setView(v)}
          date={date}
          onNavigate={(d) => setDate(d)}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event: CalendarEvent) => setDetailTask(event.resource)}
          style={{ height: 520 }}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            noEventsInRange: 'Sin tareas en este período',
            showMore: (total: number) => `+${total} más`,
          }}
          culture="es"
        />
      </div>

      {/* Task detail popup */}
      {detailTask && !editTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => e.target === e.currentTarget && setDetailTask(null)}
        >
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
            <div
              className="h-1.5"
              style={{ background: getDepartmentColor(detailTask.department) }}
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-[#1a1a2e] text-base pr-4">{detailTask.title}</h3>
                <button
                  onClick={() => setDetailTask(null)}
                  className="text-[#5d6d7e] hover:text-[#1a1a2e] text-xl leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>

              {detailTask.description && (
                <p className="text-sm text-[#5d6d7e] mb-4">{detailTask.description}</p>
              )}

              <div className="space-y-2 text-sm mb-4">
                {[
                  ['Departamento', <span
                    key="dept"
                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ background: getDepartmentColor(detailTask.department) }}
                  >{getDepartmentName(detailTask.department)}</span>],
                  ['Responsable', <span key="resp" className="font-medium text-[#1a1a2e]">{detailTask.responsible}</span>],
                  ...(detailTask.start_date ? [['Inicio', <span key="start" className="tabular-nums">{detailTask.start_date}</span>]] : []),
                  ['Fecha límite', <span key="due" className="tabular-nums font-semibold">{detailTask.due_date}</span>],
                  ['Estado', detailStatus ? <span
                    key="status"
                    className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                    style={{ background: STATUS_COLORS[detailStatus] }}
                  >{STATUS_LABELS[detailStatus]}</span> : null],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center gap-2">
                    <span className="text-[#5d6d7e] w-28 flex-shrink-0 text-xs">{label}</span>
                    {value}
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs text-[#5d6d7e] mb-1.5">
                  <span>Progreso</span>
                  <span className="font-semibold tabular-nums">{detailTask.progress}%</span>
                </div>
                <div className="bg-[#e2e8f0] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${detailTask.progress}%`,
                      background: detailTask.progress === 100 ? '#2D8A4E' : '#004c9e',
                    }}
                  />
                </div>
              </div>

              {isOwnDetail && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditTask(detailTask)
                      setDetailTask(null)
                    }}
                    className="flex-1 py-2 rounded-lg border border-[#d0dce9] text-sm font-semibold text-[#5d6d7e] hover:bg-[#f7f9fc] transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDeleteDetail}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition"
                    style={{ background: '#e74c3c' }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editTask && (
        <TaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={() => {
            setEditTask(null)
            onRefresh()
          }}
        />
      )}

      {createOpen && (
        <TaskModal
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
