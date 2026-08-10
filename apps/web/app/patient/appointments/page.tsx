import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function PatientAppointmentsPage() {
  const profile = await requireRole("patient");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Appointments</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Appointment tables and workflows are planned for a later migration
        phase.
      </p>
    </DashboardShell>
  );
}
