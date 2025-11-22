# Supabase setup for this project

This project uses Supabase to store authenticated users. The Supabase client is at `app/(tabs)/supabase.ts`.

Quick steps to prepare your Supabase database:

1. Open your Supabase project and run the SQL migration in `database/migrations/001_create_users_table.sql` (or run the SQL below) to create the `users` table:

```sql
create table if not exists public.users (
  id text not null primary key,
  name text null,
  email text null unique,
  picture text null,
  created_at timestamp with time zone default timezone('utc', now())
);
```

2. Confirm the anon key and URL in `app/(tabs)/supabase.ts` match your Supabase project. For production, move keys to environment variables (Expo secrets / `.env`) and remove hard-coded keys.

3. Run the app and sign in via Google (UI in `app/(tabs)/index.tsx`). The user will be upserted into the `users` table.

Testing tip: After sign-in, check the `users` table in Supabase Table Editor.
