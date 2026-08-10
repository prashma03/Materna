# Supabase Setup

This folder contains the production database migrations for the Next.js version
of Materna.

## Migration Workflow

1. Create a Supabase project.
2. Link the project from this app directory:

```powershell
npx supabase link --project-ref <project-ref>
```

3. Apply migrations:

```powershell
npx supabase db push
```

## Current Tables

- `profiles`: one row per Supabase Auth user, including the Materna role.
- `patients`: patient-specific record owned by a patient profile.
- `providers`: provider-specific record owned by a provider profile.
- `patient_provider_links`: explicit relationship that authorizes provider
  access to a patient.

## RLS Intent

Authentication proves who the user is. Authorization decides what that user can
access.

The first policy set keeps the model intentionally small:

- Users can read and update their own profile.
- Patients can read and update only their own patient record.
- Providers can read a patient record only when an active
  `patient_provider_links` row connects them.
- Providers are not granted global patient access.
