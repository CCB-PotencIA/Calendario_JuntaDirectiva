'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DepartmentKPIs } from '@/components/DepartmentKPIs'
import type { Task } from '@/lib/types'

export default function IndicadoresPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('tasks').select('*')
    setTasks(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Indicadores de Gestión</h1>
          <p className="text-sm text-[#5d6d7e] mt-1">
            Desempeño por departamento en tiempo real
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#d0dce9] text-sm font-semibold text-[#5d6d7e] hover:bg-white transition bg-transparent"
        >
          ↻ Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#e2e8f0] border-t-[#004c9e] rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-[#5d6d7e]">
          No hay tareas registradas aún.
        </div>
      ) : (
        <DepartmentKPIs tasks={tasks} />
      )}
    </div>
  )
}
