# Materna Web

This is the production Next.js foundation for Materna. The original Expo
prototype remains at the repository root and should be used as the visual
reference while features are ported in phases.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- ESLint
- Vercel

## Local Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Fill `.env.local` with the Supabase values from your project:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Scripts

```powershell
npm run typecheck
npm run lint
npm run build
```

## Database

The first migration lives in:

```text
supabase/migrations/0001_initial_identity_model.sql
```

It creates the identity and access model for:

- profiles
- patients
- providers
- patient_provider_links

See `supabase/README.md` and `../../docs/production-migration.md` for the
architecture notes and migration status.
