import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function PatientCheckInsPage() {
  const profile = await requireRole("patient");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Check-ins</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Symptom and check-in workflows will be added after the initial Supabase
        model is accepted.
      </p>
    </DashboardShell>
  );
}
