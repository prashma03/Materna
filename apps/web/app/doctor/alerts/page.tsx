import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function DoctorAlertsPage() {
  const profile = await requireRole("provider");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Alerts</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Alerts will only surface for patients linked to this provider in the
        production authorization model.
      </p>
    </DashboardShell>
  );
}
