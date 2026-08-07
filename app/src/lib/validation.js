export function onlyDigits(value = '') {
  return value.replace(/\D/g, '')
}

export function isValidIdentity(value) {
  const trimmed = value.trim()
  return /^\S+@\S+\.\S+$/.test(trimmed) || onlyDigits(trimmed).length === 11
}

export function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value.trim())
}

export function isValidPassword(value) {
  return value.length >= 6
}

export function isAdultEnough(value, minimumAge = 16) {
  if (!value) return false
  const birth = new Date(`${value}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return false
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age >= minimumAge
}

export function isNotFutureDate(value) {
  if (!value) return false
  const date = new Date(`${value}T00:00:00`)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return !Number.isNaN(date.getTime()) && date <= today
}
