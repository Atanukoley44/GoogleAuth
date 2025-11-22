CREATE TABLE IF NOT EXISTS public.users (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  picture TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
