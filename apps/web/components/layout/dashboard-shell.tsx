import type { ReactNode } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import type { AuthenticatedProfile } from "@/types/auth";
import { signOut } from "@/features/auth/actions";

type DashboardShellProps = {
  profile: AuthenticatedProfile;
  children: ReactNode;
};

export function DashboardShell({ profile, children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[var(--border)] bg-white p-6 lg:block">
        <BrandMark />
        <div className="mt-10 rounded-lg bg-[var(--panel-soft)] p-4">
          <p className="text-sm font-semibold">{profile.fullName}</p>
          <p className="mt-1 text-xs capitalize text-[var(--muted)]">
            {profile.role}
          </p>
        </div>
        <form action={signOut} className="absolute bottom-6 left-6 right-6">
          <button className="min-h-11 w-full rounded-md border border-[var(--border)] text-sm font-semibold hover:bg-[var(--panel-soft)]">
            Log out
          </button>
        </form>
      </aside>
      <section className="lg:pl-72">
        <header className="border-b border-[var(--border)] bg-white/90 px-5 py-4 backdrop-blur lg:hidden">
          <BrandMark />
        </header>
        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10">
          {children}
        </div>
      </section>
    </main>
  );
}
