function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`A variável ${name} é obrigatória.`)
  return value
}

export function loadConfig() {
  const jwtSecret = required('JWT_SECRET')
  if (jwtSecret.length < 32) throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.')

  return {
    port: Number(process.env.PORT || 3001),
    databaseUrl: required('DATABASE_URL'),
    databaseSsl: process.env.DATABASE_SSL === 'true',
    jwtSecret,
    secureCookies: process.env.NODE_ENV === 'production',
    sessionCookieName: process.env.SESSION_COOKIE_NAME || 'mamabloom_session',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  }
}
