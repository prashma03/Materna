import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/session";

export default async function PatientChatPage() {
  const profile = await requireRole("patient");

  return (
    <DashboardShell profile={profile}>
      <h1 className="text-3xl font-black">Ask Materna</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        The care chat UI is intentionally not ported yet. Phase 1 only proves
        protected routing and Supabase account ownership.
      </p>
    </DashboardShell>
  );
}
