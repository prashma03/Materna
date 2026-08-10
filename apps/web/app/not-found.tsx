import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          This part of Materna is not available yet.
        </p>
        <Button asChild className="mt-6" href="/login">
          Return to login
        </Button>
      </section>
    </main>
  );
}
