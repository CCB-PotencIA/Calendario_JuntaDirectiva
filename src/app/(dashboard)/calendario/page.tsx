'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TaskCalendar } from '@/components/TaskCalendar'
import { TaskTable } from '@/components/TaskTable'
import type { Task } from '@/lib/types'

export default function CalendarioPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })
    setTasks(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Calendario de Tareas</h1>
        <p className="text-sm text-[#5d6d7e] mt-1">
          Vista general de todas las tareas por departamento
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 border-4 border-[#e2e8f0] border-t-[#004c9e] rounded-full animate-spin"
          />
        </div>
      ) : (
        <>
          <TaskCalendar tasks={tasks} onRefresh={fetchTasks} />

          <div>
            <h2 className="font-bold text-[#1a1a2e] text-base mb-4">Lista de tareas</h2>
            <TaskTable tasks={tasks} onRefresh={fetchTasks} />
          </div>
        </>
      )}
    </div>
  )
}
