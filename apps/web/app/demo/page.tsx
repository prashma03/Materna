import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <BrandMark />
          <Link
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold hover:bg-[var(--panel-soft)]"
            href="/"
          >
            Back home
          </Link>
        </header>

        <section className="py-16 text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--primary-strong)]">
            Explore Materna
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Choose an experience to explore
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Recruiter demo mode uses fictional data and bypasses signup so you
            can inspect the patient and provider workflows immediately.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <DemoCard
            eyebrow="Patient"
            title="28 weeks pregnant"
            detail="Log symptoms, view vitals, check risk, and trigger a simulated care-team alert."
            href="/demo/patient"
            metrics={["Low risk", "2 symptoms this week", "1 upcoming visit"]}
          />
          <DemoCard
            eyebrow="Doctor"
            title="12 patients"
            detail="Review priority patients, active alerts, care notes, and linked maternal profiles."
            href="/demo/doctor"
            metrics={["3 active alerts", "5 high-priority reviews", "8 new reports"]}
            tone="violet"
          />
        </section>

        <p className="mt-8 text-center text-sm font-semibold text-[var(--muted)]">
          No account required. Demo data only. Real authentication remains
          available through Sign in.
        </p>
      </div>
    </main>
  );
}

function DemoCard({
  eyebrow,
  title,
  detail,
  href,
  metrics,
  tone = "green",
}: {
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  metrics: string[];
  tone?: "green" | "violet";
}) {
  const accent = tone === "violet" ? "var(--violet)" : "var(--primary)";

  return (
    <Link
      className="group rounded-[1.75rem] border border-[var(--border)] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      href={href}
    >
      <p className="text-sm font-black uppercase tracking-[0.22em]" style={{ color: accent }}>
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-black">{title}</h2>
      <p className="mt-4 min-h-14 text-sm leading-6 text-[var(--muted)]">
        {detail}
      </p>
      <div className="mt-6 grid gap-3">
        {metrics.map((metric) => (
          <div
            className="rounded-xl bg-[var(--panel-soft)] px-4 py-3 text-sm font-bold"
            key={metric}
          >
            {metric}
          </div>
        ))}
      </div>
      <p className="mt-7 text-sm font-black" style={{ color: accent }}>
        Enter {eyebrow} Demo →
      </p>
    </Link>
  );
}
