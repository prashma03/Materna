"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/shared/brand-mark";
import { StatusCard } from "@/components/shared/status-card";

export default function PatientDemoPage() {
  const [symptomLogged, setSymptomLogged] = useState(false);
  const vitals = symptomLogged
    ? [
        ["Blood pressure", "142/92", "Needs review", "text-red-600"],
        ["Heart rate", "96 bpm", "Elevated", "text-amber-600"],
        ["Oxygen SpO2", "97%", "Normal", "text-[var(--primary-strong)]"],
        ["Skin temp", "99.2 F", "Slightly high", "text-amber-600"],
        ["Respiration", "18/min", "Normal", "text-[var(--primary-strong)]"],
        ["HRV", "38 ms", "Lower than baseline", "text-amber-600"],
      ]
    : [
        ["Blood pressure", "118/76", "Normal", "text-[var(--primary-strong)]"],
        ["Heart rate", "78 bpm", "Resting", "text-[var(--primary-strong)]"],
        ["Oxygen SpO2", "99%", "Normal", "text-[var(--primary-strong)]"],
        ["Skin temp", "98.4 F", "Normal", "text-[var(--primary-strong)]"],
        ["Respiration", "15/min", "Normal", "text-[var(--primary-strong)]"],
        ["HRV", "60 ms", "Baseline", "text-[var(--primary-strong)]"],
      ];
  const screeningItems = symptomLogged
    ? [
        ["Preeclampsia screen", "Review", "BP trend + headache with vision changes"],
        ["Fetal movement", "Normal", "Kick count completed this morning"],
        ["Bleeding screen", "Clear", "No bleeding or spotting reported"],
        ["Care escalation", "Prepared", "Doctor alert ready for same-day review"],
      ]
    : [
        ["Preeclampsia screen", "Clear", "No headache, vision change, or swelling reported"],
        ["Fetal movement", "Normal", "Kick count completed this morning"],
        ["Bleeding screen", "Clear", "No bleeding or spotting reported"],
        ["Care escalation", "Routine", "No provider alert needed today"],
      ];
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
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--primary-strong)]">
                  Current vitals
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Watch screening snapshot
                </h2>
              </div>
              <p className="text-sm font-semibold text-[var(--muted)]">
                Synced 2 min ago
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {vitals.map(([title, value, status, colorClass]) => (
                <article
                  className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4"
                  key={title}
                >
                  <p className="text-xs font-bold text-[var(--muted)]">
                    {title}
                  </p>
                  <p className="mt-2 text-2xl font-black">{value}</p>
                  <p className={`mt-1 text-xs font-black ${colorClass}`}>
                    {status}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--primary-strong)]">
                  Maternal screening
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Early-risk checklist
                </h2>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ backgroundColor: risk.color }}
              >
                {risk.label}
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {screeningItems.map(([title, status, detail]) => (
                <article
                  className="rounded-2xl border border-[var(--border)] p-4"
                  key={title}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {detail}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        status === "Review" || status === "Prepared"
                          ? "bg-red-50 text-red-600"
                          : "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Materna Watch</h2>
              <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-black text-[var(--primary-strong)]">
                Connected
              </span>
            </div>
            <div className="mt-5 rounded-[2rem] border border-[var(--border)] bg-[#0f172a] p-5 text-white">
              <div className="mx-auto flex size-36 flex-col items-center justify-center rounded-[2rem] border-4 border-slate-700 bg-slate-950 text-center shadow-inner">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                  Materna
                </p>
                <p className="mt-3 text-3xl font-black">
                  {symptomLogged ? "Review" : "Stable"}
                </p>
                <p className="mt-2 text-xs text-slate-300">
                  Battery 84%
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--panel-soft)] p-3">
                <p className="font-black">Fall screen</p>
                <p className="mt-1 text-xs text-[var(--muted)]">No fall detected</p>
              </div>
              <div className="rounded-xl bg-[var(--panel-soft)] p-3">
                <p className="font-black">Motion</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Normal activity</p>
              </div>
            </div>
          </div>

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
            <h2 className="text-xl font-black">Recent screening</h2>
            <div className="mt-4 space-y-4">
              {[
                ["8:12 AM", "Watch synced vitals"],
                ["8:15 AM", symptomLogged ? "Symptom logged: headache + vision changes" : "Kick count completed"],
                ["8:16 AM", symptomLogged ? "Provider alert prepared" : "Daily screen marked routine"],
              ].map(([time, event]) => (
                <div className="flex gap-3" key={`${time}-${event}`}>
                  <div className="mt-1 size-2 rounded-full bg-[var(--primary)]" />
                  <div>
                    <p className="text-xs font-black text-[var(--muted)]">{time}</p>
                    <p className="text-sm font-semibold">{event}</p>
                  </div>
                </div>
              ))}
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
