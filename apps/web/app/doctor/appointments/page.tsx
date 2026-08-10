import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function DoctorAppointmentsPage() {
  const profile = await requireRole("provider");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Appointments</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Provider scheduling will be introduced after the core account and link
        model is reviewed.
      </p>
    </DashboardShell>
  );
}
