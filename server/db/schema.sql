-- server/db/schema.sql
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY,
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id            UUID        PRIMARY KEY,
  title         TEXT        NOT NULL,
  description   TEXT,
  status        TEXT        NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
  user_id       UUID        NOT NULL REFERENCES users(id),
  is_deleted    BOOLEAN     DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);