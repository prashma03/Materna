import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function DoctorPatientsPage() {
  const profile = await requireRole("provider");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Patients</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Provider patient lists will use active patient-provider links rather
        than global patient access.
      </p>
    </DashboardShell>
  );
}
