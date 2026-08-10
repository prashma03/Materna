"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { StatusCard } from "@/components/shared/status-card";

export default function PatientDemoPage() {
  const [symptomLogged, setSymptomLogged] = useState(false);
  const risk = symptomLogged
    ? {
        label: "Needs review",
        color: "var(--danger)",
        guidance:
          "Materna flagged headache with vision changes and prepared a provider alert.",
      }
    : {
        label: "Low risk",
        color: "var(--primary)",
        guidance: "Vitals and recent symptom history look stable today.",
      };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <DemoHeader active="patient" />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-7 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary-strong)]">
              Patient demo
            </p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-4xl font-black">Maya Johnson</h1>
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                  28 weeks pregnant · Desha County, Arkansas
                </p>
              </div>
              <div
                className="rounded-full px-4 py-2 text-sm font-black text-white"
                style={{ backgroundColor: risk.color }}
              >
                {risk.label}
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {risk.guidance}
            </p>
          </div>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <StatusCard
              detail="Normal range"
              title="Blood pressure"
              value={symptomLogged ? "142/92" : "118/76"}
            />
            <StatusCard
              detail="Resting"
              title="Heart rate"
              value={symptomLogged ? "96 bpm" : "78 bpm"}
            />
            <StatusCard
              detail={symptomLogged ? "Flagged today" : "Tracked this week"}
              title="Symptoms"
              value={symptomLogged ? "3 logged" : "2 logged"}
            />
          </section>

          <section className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="text-2xl font-black">Today&apos;s care plan</h2>
            <div className="mt-5 grid gap-3">
              {[
                symptomLogged
                  ? "Contact your care team today about headache and vision changes."
                  : "Log any new symptoms before the end of the day.",
                "Keep your pregnancy profile and emergency contact updated.",
                "Confirm your closest labor and delivery hospital route.",
              ].map((item) => (
                <div
                  className="rounded-xl bg-[var(--panel-soft)] px-4 py-3 text-sm font-bold"
                  key={item}
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="text-2xl font-black">Try the workflow</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Click the symptom action to watch the patient dashboard change
              and create the story a provider would see.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="min-h-12 rounded-md bg-[var(--primary)] px-5 text-sm font-black text-white hover:bg-[var(--primary-strong)]"
                onClick={() => setSymptomLogged(true)}
              >
                Log demo symptom
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--border)] bg-white px-5 text-sm font-black hover:bg-[var(--panel-soft)]"
                href="/demo/doctor?alert=maya"
              >
                View doctor alert →
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="text-xl font-black">Pregnancy progress</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="flex size-28 items-center justify-center rounded-full border-[10px] border-[var(--primary)]">
                <div className="text-center">
                  <p className="text-3xl font-black">28</p>
                  <p className="text-xs font-black">weeks</p>
                </div>
              </div>
              <div>
                <p className="font-black">3rd trimester</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  12 weeks to go
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="text-xl font-black">Nearby care</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Delta Memorial Hospital · 8 miles · Labor & Delivery listed
            </p>
            <p className="mt-4 text-sm font-black text-[var(--primary-strong)]">
              Directions ready
            </p>
          </div>

          {symptomLogged ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600">
                Alert prepared
              </p>
              <p className="mt-3 text-sm leading-6 text-red-900">
                Provider dashboard now receives a high-priority review flag for
                Maya Johnson.
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function DemoHeader({ active }: { active: "patient" | "doctor" }) {
  return (
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
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              active === "patient"
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)]"
            }`}
            href="/demo/patient"
          >
            Patient view
          </Link>
          <Link
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              active === "doctor"
                ? "bg-[var(--violet)] text-white"
                : "border border-[var(--border)]"
            }`}
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
  );
}
