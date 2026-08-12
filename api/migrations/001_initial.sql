CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  cpf CHAR(11) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  password_hash TEXT NOT NULL,
  pregnancy JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_key VARCHAR(80) NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, data_key)
);

CREATE INDEX IF NOT EXISTS user_data_updated_at_idx ON user_data(updated_at DESC);
