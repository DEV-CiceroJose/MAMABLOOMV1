import { addDays, toDateKey } from '../lib/date.js'

export function createDefaultAppointments() {
  const today = new Date()
  return [
    {
      id: crypto.randomUUID(),
      title: 'Consulta de pré-natal',
      type: 'Consulta',
      date: toDateKey(addDays(today, 1)),
      time: '09:30',
      reminder: true,
    },
    {
      id: crypto.randomUUID(),
      title: 'Vacinação',
      type: 'Vacina',
      date: toDateKey(addDays(today, 8)),
      time: '14:00',
      reminder: true,
    },
  ]
}

export const moods = [
  { id: 'muito-bem', emoji: '😄', label: 'Muito bem', tone: 'green' },
  { id: 'bem', emoji: '🙂', label: 'Bem', tone: 'lime' },
  { id: 'neutra', emoji: '😐', label: 'Neutra', tone: 'yellow' },
  { id: 'cansada', emoji: '😟', label: 'Cansada', tone: 'orange' },
  { id: 'mal', emoji: '😞', label: 'Mal', tone: 'red' },
]

export const appointmentTypes = ['Consulta', 'Exame', 'Vacina', 'Medicamento', 'Outro']

export const bloodTypes = ['Não informado', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−']
