import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { StatusCard } from "@/components/shared/status-card";

export default function DoctorDemoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <BrandMark />
          <nav className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold hover:bg-[var(--panel-soft)]"
              href="/demo"
            >
              Demo home
            </Link>
            <Link
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-bold"
              href="/demo/patient"
            >
              Patient view
            </Link>
            <Link
              className="rounded-full bg-[var(--violet)] px-4 py-2 text-sm font-bold text-white"
              href="/demo/doctor"
            >
              Doctor view
            </Link>
            <Link className="text-sm font-bold text-[var(--muted)]" href="/login">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-7 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--violet)]">
            Provider demo
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-black">Dr. Aisha Patel</h1>
              <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                OB-GYN · Delta Memorial Hospital
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-5 text-sm font-black text-white hover:bg-[var(--primary-strong)]"
              href="/demo/patient"
            >
              Switch to patient view
            </Link>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <StatusCard detail="Linked through care teams" title="Patients" value="12" />
          <StatusCard detail="Requires review today" title="High risk" value="3" />
          <StatusCard detail="Patient-approved summaries" title="Reports" value="8" />
          <StatusCard detail="Unacknowledged" title="Alerts" value="3" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="text-2xl font-black">Priority queue</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Maya Johnson", "Needs review", "Headache with vision changes · BP 142/92", "Desha County"],
                ["Maria Gonzalez", "Critical", "Severe hypertension pattern · BP 163/109", "Jefferson County"],
                ["Tanya Williams", "High", "Diabetes history + reduced fetal movement", "Phillips County"],
              ].map(([name, risk, detail, county]) => (
                <article
                  className="rounded-2xl border border-[var(--border)] p-4"
                  key={name}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-black">{name}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">{county}</p>
                      <p className="mt-3 text-sm font-semibold">{detail}</p>
                    </div>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                      {risk}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
                Live alert
              </p>
              <h2 className="mt-3 text-2xl font-black text-red-950">
                Maya Johnson flagged
              </h2>
              <p className="mt-3 text-sm leading-6 text-red-900">
                Patient logged headache with vision changes. Materna elevated
                the case for provider review and recommends same-day contact.
              </p>
              <button className="mt-5 min-h-11 rounded-md bg-red-600 px-5 text-sm font-black text-white">
                Acknowledge alert
              </button>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
              <h2 className="text-xl font-black">Doctor note</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Call patient, verify blood pressure, review preeclampsia
                warning signs, and direct to nearest L&D care if symptoms
                worsen.
              </p>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
