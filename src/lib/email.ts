import { Resend } from 'resend'
import type { Task } from './types'
import { getDepartmentName } from './departments'

export async function sendTaskReminderEmail(
  toEmail: string,
  task: Task,
  daysLeft: number
) {
  const deptName = getDepartmentName(task.department)
  const appUrl = process.env.APP_URL ?? 'https://calendarioccb.vercel.app'

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'CCB Calendario <noreply@calendarioccb.com>',
    to: toEmail,
    subject: `⚠️ Tarea próxima a vencer: ${task.title}`,
    html: `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #004c9e; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 18px;">Recordatorio de Tarea — CCB</h2>
        </div>
        <div style="background: #f5f5f0; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="color: #e74c3c; font-weight: 700; margin: 0 0 16px;">
            Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}
          </p>
          <h3 style="color: #1a1a2e; margin: 0 0 8px;">${task.title}</h3>
          <p style="color: #5d6d7e; margin: 0 0 4px;"><strong>Departamento:</strong> ${deptName}</p>
          <p style="color: #5d6d7e; margin: 0 0 4px;"><strong>Responsable:</strong> ${task.responsible}</p>
          <p style="color: #5d6d7e; margin: 0 0 4px;"><strong>Fecha límite:</strong> ${task.due_date}</p>
          <p style="color: #5d6d7e; margin: 0 0 20px;"><strong>Progreso:</strong> ${task.progress}%</p>
          <a href="${appUrl}/calendario" style="background: #004c9e; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600;">
            Ver en el calendario
          </a>
        </div>
      </div>
    `,
  })
}
