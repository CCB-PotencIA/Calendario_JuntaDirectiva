import { createServerClient } from '@supabase/ssr'
import { sendTaskReminderEmail } from '@/lib/email'
import type { Task } from '@/lib/types'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const in1 = new Date(today)
  in1.setDate(in1.getDate() + 1)
  const in3 = new Date(today)
  in3.setDate(in3.getDate() + 3)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .in('due_date', [fmt(in1), fmt(in3)])
    .lt('progress', 100)

  if (error) {
    console.error('Cron error fetching tasks:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const results: string[] = []

  for (const task of (tasks as Task[]) ?? []) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('department', task.department)
      .single()

    if (!profile?.email) continue

    const daysLeft = task.due_date === fmt(in1) ? 1 : 3

    try {
      await sendTaskReminderEmail(profile.email, task, daysLeft)
      results.push(`Sent to ${profile.email} for task ${task.id}`)
    } catch (err) {
      console.error('Email error:', err)
      results.push(`Failed for task ${task.id}`)
    }
  }

  return Response.json({ sent: results.length, details: results })
}
