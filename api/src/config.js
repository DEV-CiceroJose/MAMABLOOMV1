function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`A variável ${name} é obrigatória.`)
  return value
}

export function loadConfig() {
  const jwtSecret = required('JWT_SECRET')
  if (jwtSecret.length < 32) throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.')

  const dataStore = (process.env.DATA_STORE || 'postgres').trim().toLowerCase()
  if (!['json', 'postgres'].includes(dataStore)) {
    throw new Error('DATA_STORE deve ser "json" ou "postgres".')
  }
  const databaseSchema = process.env.DATABASE_SCHEMA || 'public'
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(databaseSchema)) {
    throw new Error('DATABASE_SCHEMA deve ser um identificador PostgreSQL válido.')
  }

  return {
    port: Number(process.env.PORT || 3001),
    dataStore,
    dataFilePath: process.env.DATA_FILE_PATH || './data/mamabloom.json',
    databaseUrl: dataStore === 'postgres' ? required('DATABASE_URL') : (process.env.DATABASE_URL || ''),
    databaseSsl: process.env.DATABASE_SSL === 'true',
    databaseSchema,
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
