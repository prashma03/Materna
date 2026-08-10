import type { ReactNode } from "react";
import { BrandMark } from "@/components/shared/brand-mark";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <main className="grid min-h-screen bg-[#06100d] px-5 py-8 text-white lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
      <section className="hidden flex-col justify-between rounded-lg border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(19,166,90,0.25),transparent_34%),linear-gradient(145deg,rgba(6,16,13,0.92),rgba(3,7,8,0.98))] p-10 lg:flex">
        <BrandMark />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-green-300">
            Rural care coordination
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-tight">
            Materna keeps patients and providers connected.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            This production foundation replaces demo role switching with real
            authentication, data ownership, and protected care workflows.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Software support only. In an emergency, call 911.
        </p>
      </section>

      <section className="flex items-center justify-center lg:px-10">
        <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white p-7 text-[var(--foreground)] shadow-2xl">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="mt-7 lg:mt-0">
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
