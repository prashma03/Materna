"use client";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--panel)] p-8 shadow-sm">
        <p className="text-sm font-semibold text-[var(--primary-strong)]">
          Materna
        </p>
        <h1 className="mt-3 text-2xl font-bold">Something needs attention.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {error.message ||
            "The page could not finish loading. Please try again."}
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}
