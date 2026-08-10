# Materna Production Migration

## Status

Phase 1 is the production foundation. It does not replace the existing
Expo/React Native prototype and it does not port the full UI yet.

## Original Prototype

The root of this repository remains the original Expo implementation.

```text
App.js
backend/
src/
assets/
api/
```

That prototype is still useful because it contains the visual direction,
patient workflows, doctor dashboard, emergency flow, hospital navigation,
profile screen, and care chat experience.

## Why Migrate

The prototype uses local device state, screen-state role switching, sample
data, and an Express bridge API. That is enough for a hackathon/prototype, but a
production recruiter-facing app needs:

- Real authentication.
- Durable relational data.
- Role-based route protection.
- Row Level Security.
- A documented database model.
- A web deployment path that is easy to explain.

## New Production App

The production foundation lives separately in:

```text
apps/web/
```

This keeps the Expo prototype safe while allowing the production web app to use
Next.js App Router, TypeScript, Tailwind CSS, Supabase, and Vercel.

Current structure:

```text
apps/web/
  app/
    (auth)/
    patient/
    doctor/
  components/
    layout/
    shared/
    ui/
  features/
    auth/
  lib/
    auth/
    supabase/
    validation/
  supabase/
    migrations/
  types/
```

## Supabase Architecture

The app uses Supabase Auth for identity and Postgres tables for application
records. The `profiles` table connects directly to `auth.users`.

Initial tables:

- `profiles`
- `patients`
- `providers`
- `patient_provider_links`

The `patient_provider_links` table is the authorization bridge. A provider does
not automatically have access to every patient. Access must come from an active
link row.

## Authentication vs Authorization

Authentication answers: who is signed in?

Authorization answers: what can that signed-in user access?

In Phase 1:

- Supabase Auth manages login/signup.
- Middleware blocks unauthenticated access to `/patient/*` and `/doctor/*`.
- Middleware redirects users away from routes for the wrong role.
- RLS policies protect database rows even if a request bypasses the UI.

## Environment Setup

Copy the example file:

```powershell
Copy-Item apps/web/.env.example apps/web/.env.local
```

Then add values from Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not commit `.env.local`.

## Database Migration Workflow

From `apps/web`, link a Supabase project and push migrations:

```powershell
npx supabase link --project-ref <project-ref>
npx supabase db push
```

The initial migration is:

```text
apps/web/supabase/migrations/0001_initial_identity_model.sql
```

## Current Functional Scope

Implemented in Phase 1:

- Next.js App Router foundation.
- TypeScript and Tailwind setup.
- Supabase client/server/middleware utilities.
- Signup and login forms.
- Patient/provider role selection during signup.
- Protected patient dashboard placeholder.
- Protected provider dashboard placeholder.
- Initial database migration and RLS policies.
- Loading, error, and not-found UI.

Not implemented yet:

- Full patient dashboard port.
- Full doctor dashboard port.
- Materna chat port.
- Profile editing against Supabase.
- Appointments and alerts data model.
- Report generation in the production app.
- Provider-patient invitation workflow.

## Recommended Phase 2

Phase 2 should connect the placeholder dashboards to real Supabase reads and
port only the highest-value patient screens first:

1. Patient dashboard shell.
2. Profile read/update flow.
3. Provider patient list based on `patient_provider_links`.
4. Basic seed data for demo/recruiter walkthroughs.
