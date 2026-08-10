export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--primary-soft)]" />
        <div className="mt-5 h-8 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
      </div>
    </main>
  );
}
