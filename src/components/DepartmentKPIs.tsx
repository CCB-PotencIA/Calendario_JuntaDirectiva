'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import { DEPARTMENTS } from '@/lib/departments'
import { getEffectiveStatus } from '@/lib/utils'
import type { Task } from '@/lib/types'
import { startOfWeek, format, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  tasks: Task[]
}

interface DeptStats {
  slug: string
  name: string
  color: string
  total: number
  completed: number
  pending: number
  in_progress: number
  overdue: number
  avgProgress: number
}

export function DepartmentKPIs({ tasks }: Props) {
  const stats: DeptStats[] = DEPARTMENTS.map((dept) => {
    const deptTasks = tasks.filter((t) => t.department === dept.slug)
    const total = deptTasks.length
    const completed = deptTasks.filter((t) => getEffectiveStatus(t) === 'completed').length
    const overdue = deptTasks.filter((t) => getEffectiveStatus(t) === 'overdue').length
    const in_progress = deptTasks.filter((t) => getEffectiveStatus(t) === 'in_progress').length
    const pending = deptTasks.filter((t) => getEffectiveStatus(t) === 'pending').length
    const avgProgress =
      total > 0 ? Math.round(deptTasks.reduce((s, t) => s + t.progress, 0) / total) : 0
    return { ...dept, total, completed, pending, in_progress, overdue, avgProgress }
  })

  const barData = stats.map((s) => ({
    name: s.name.split(' ')[0],
    Completadas: s.completed,
    Pendientes: s.pending + s.in_progress,
    Vencidas: s.overdue,
  }))

  // Weekly completed tasks — last 8 weeks
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 })
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const completed = tasks.filter((t) => {
      if (getEffectiveStatus(t) !== 'completed') return false
      const due = new Date(t.due_date + 'T00:00:00')
      return due >= weekStart && due < weekEnd
    }).length
    return {
      week: format(weekStart, 'dd MMM', { locale: es }),
      Completadas: completed,
    }
  })

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.slug}
            className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden"
          >
            <div className="h-1" style={{ background: s.color }} />
            <div className="p-4">
              <h3 className="font-bold text-[#1a1a2e] text-sm mb-3 truncate" title={s.name}>
                {s.name}
              </h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
                <Metric label="Total" value={s.total} />
                <Metric label="Completadas" value={s.completed} color="#2D8A4E" />
                <Metric label="En curso" value={s.pending + s.in_progress} color="#004c9e" />
                <Metric label="Vencidas" value={s.overdue} color="#e74c3c" />
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-[#5d6d7e] mb-1">
                  <span>Progreso promedio</span>
                  <span className="font-semibold tabular-nums">{s.avgProgress}%</span>
                </div>
                <div className="bg-[#e2e8f0] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${s.avgProgress}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <h3 className="font-bold text-[#1a1a2e] text-sm mb-4">
            Estado de tareas por departamento
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5d6d7e' }} />
              <YAxis tick={{ fontSize: 11, fill: '#5d6d7e' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Completadas" fill="#2D8A4E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Pendientes" fill="#004c9e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Vencidas" fill="#e74c3c" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <h3 className="font-bold text-[#1a1a2e] text-sm mb-4">
            Tareas completadas por semana (últimas 8)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#5d6d7e' }} />
              <YAxis tick={{ fontSize: 11, fill: '#5d6d7e' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="Completadas"
                stroke="#009de2"
                fill="rgba(0,157,226,0.1)"
                strokeWidth={2}
                dot={{ r: 4, fill: '#009de2' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div>
      <div className="text-xs text-[#5d6d7e]">{label}</div>
      <div
        className="text-lg font-black tabular-nums leading-tight"
        style={{ color: color ?? '#1a1a2e' }}
      >
        {value}
      </div>
    </div>
  )
}
