import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusCard } from "@/components/shared/status-card";
import { requireRole } from "@/lib/auth/session";

export default async function DoctorDashboardPage() {
  const profile = await requireRole("provider");

  return (
    <DashboardShell profile={profile}>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--violet)]">
          Provider workspace
        </p>
        <h1 className="text-3xl font-black tracking-tight">
          Good morning, {profile.fullName}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          This protected page proves the provider auth path. The detailed
          clinical dashboard remains in the Expo prototype until Phase 2.
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <StatusCard
          detail="Created through the profiles table"
          title="Role"
          value="Provider"
        />
        <StatusCard
          detail="Patient access will depend on active links"
          title="Authorization"
          value="Scoped"
        />
        <StatusCard
          detail="Provider route is not available to patients"
          title="Security"
          value="Protected"
        />
      </section>
    </DashboardShell>
  );
}
