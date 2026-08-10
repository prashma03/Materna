import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function PatientProfilePage() {
  const profile = await requireRole("patient");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Profile</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Profile editing will be implemented after the production data model is
        reviewed. The Expo profile screen remains the visual reference.
      </p>
    </DashboardShell>
  );
}
