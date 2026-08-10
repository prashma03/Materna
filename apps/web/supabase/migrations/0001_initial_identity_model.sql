create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'provider')),
  full_name text not null check (char_length(trim(full_name)) > 1),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_unique unique (email)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  pregnancy_week integer check (pregnancy_week between 1 and 42),
  county text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patients_profile_unique unique (profile_id)
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  specialty text,
  organization text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint providers_profile_unique unique (profile_id)
);

create table public.patient_provider_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patient_provider_links_unique unique (patient_id, provider_id)
);

create index patients_profile_id_idx on public.patients(profile_id);
create index providers_profile_id_idx on public.providers(profile_id);
create index patient_provider_links_patient_id_idx on public.patient_provider_links(patient_id);
create index patient_provider_links_provider_id_idx on public.patient_provider_links(provider_id);
create index patient_provider_links_active_idx
  on public.patient_provider_links(patient_id, provider_id)
  where status = 'active';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create trigger providers_set_updated_at
before update on public.providers
for each row execute function public.set_updated_at();

create trigger patient_provider_links_set_updated_at
before update on public.patient_provider_links
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_patient_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.patients where profile_id = auth.uid()
$$;

create or replace function public.current_provider_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.providers where profile_id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.patient_provider_links enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Users can create their own profile"
on public.profiles for insert
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Patients can read their own patient record"
on public.patients for select
using (profile_id = auth.uid());

create policy "Linked providers can read active patient records"
on public.patients for select
using (
  exists (
    select 1
    from public.patient_provider_links links
    where links.patient_id = patients.id
      and links.provider_id = public.current_provider_id()
      and links.status = 'active'
  )
);

create policy "Patients can create their own patient record"
on public.patients for insert
with check (
  profile_id = auth.uid()
  and public.current_user_role() = 'patient'
);

create policy "Patients can update their own patient record"
on public.patients for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "Providers can read their own provider record"
on public.providers for select
using (profile_id = auth.uid());

create policy "Patients can read linked provider records"
on public.providers for select
using (
  exists (
    select 1
    from public.patient_provider_links links
    where links.provider_id = providers.id
      and links.patient_id = public.current_patient_id()
      and links.status = 'active'
  )
);

create policy "Providers can create their own provider record"
on public.providers for insert
with check (
  profile_id = auth.uid()
  and public.current_user_role() = 'provider'
);

create policy "Providers can update their own provider record"
on public.providers for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "Linked users can read patient provider links"
on public.patient_provider_links for select
using (
  patient_id = public.current_patient_id()
  or provider_id = public.current_provider_id()
);

create policy "Patients can request provider links for themselves"
on public.patient_provider_links for insert
with check (patient_id = public.current_patient_id());
