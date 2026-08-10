import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusCard } from "@/components/shared/status-card";
import { requireRole } from "@/lib/auth/session";

export default async function PatientDashboardPage() {
  const profile = await requireRole("patient");

  return (
    <DashboardShell profile={profile}>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary-strong)]">
          Patient workspace
        </p>
        <h1 className="text-3xl font-black tracking-tight">
          Good morning, {profile.fullName}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          This protected page proves the patient auth path. The full dashboard
          from the Expo prototype will be ported in a later phase.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StatusCard
          detail="Created through the profiles table"
          title="Role"
          value="Patient"
        />
        <StatusCard
          detail="Patient record is created at signup"
          title="Patient record"
          value="Ready"
        />
        <StatusCard
          detail="Access controlled by middleware and RLS"
          title="Security"
          value="Protected"
        />
      </section>
    </DashboardShell>
  );
}
