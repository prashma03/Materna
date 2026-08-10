import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";

const workflowSteps = [
  "Log symptoms",
  "Assess risk",
  "Alert care team",
  "Review provider dashboard",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <BrandMark />
          <nav className="flex items-center gap-3">
            <Link
              className="rounded-full px-4 py-2 text-sm font-bold text-[var(--primary-strong)] hover:bg-[var(--primary-soft)]"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-[var(--primary-strong)]"
              href="/demo"
            >
              Try live demo
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <section>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[var(--primary-strong)]">
              Rural maternal health platform
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
              Maternal care, wherever you are.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Materna supports safer pregnancies in rural communities through
              symptom monitoring, early-risk detection, provider alerts, and
              care-resource discovery.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--primary)] px-6 text-sm font-black text-white shadow-sm hover:bg-[var(--primary-strong)]"
                href="/demo"
              >
                Try live demo
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--border)] bg-white px-6 text-sm font-black hover:bg-[var(--panel-soft)]"
                href="/login"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
              No account needed for demo mode. Fictional demo data only.
            </p>
          </section>

          <section className="rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-2xl">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#effaf2,#ffffff)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--primary-strong)]">
                    Maya Johnson · Week 28
                  </p>
                  <h2 className="mt-2 text-3xl font-black">LOW RISK</h2>
                </div>
                <div className="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-black text-[var(--primary-strong)]">
                  Stable
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ["Blood Pressure", "118/76", "Normal"],
                  ["Heart Rate", "78 bpm", "Normal"],
                  ["Symptoms", "2 this week", "Tracked"],
                  ["Next Visit", "Aug 14", "10:30 AM"],
                ].map(([label, value, detail]) => (
                  <article
                    className="rounded-2xl border border-[var(--border)] bg-white p-4"
                    key={label}
                  >
                    <p className="text-xs font-bold text-[var(--muted)]">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-black">{value}</p>
                    <p className="mt-1 text-xs font-bold text-[var(--primary-strong)]">
                      {detail}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm font-black">How Materna works</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {workflowSteps.map((step, index) => (
                    <div
                      className="rounded-xl bg-[var(--panel-soft)] p-3 text-center text-xs font-black"
                      key={step}
                    >
                      <span className="mb-2 inline-flex size-7 items-center justify-center rounded-full bg-white text-[var(--primary-strong)]">
                        {index + 1}
                      </span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
