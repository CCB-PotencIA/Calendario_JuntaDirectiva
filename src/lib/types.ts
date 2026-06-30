export interface Task {
  id: number
  title: string
  description: string | null
  department: string
  responsible: string
  start_date: string | null
  due_date: string
  progress: number
  status: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  department: string
  department_name: string
  email: string
}

export interface Department {
  slug: string
  name: string
  color: string
}
