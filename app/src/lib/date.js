export function toDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

export function parseDateKey(key) {
  return new Date(`${key}T12:00:00`)
}

export function formatShortDate(key) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(parseDateKey(key))
    .replace('.', '')
}

export function formatLongDate(key) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parseDateKey(key))
}

export function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leading = firstDay.getDay()
  const cells = []
  for (let index = 0; index < leading; index += 1) cells.push(null)
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}
