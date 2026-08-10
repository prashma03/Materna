export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-black text-white">
        M
      </div>
      <div>
        <p className="text-xl font-black tracking-[0.14em] text-[var(--foreground)]">
          MATERNA
        </p>
        <p className="text-xs text-[var(--muted)]">Care for you. Care for two.</p>
      </div>
    </div>
  );
}
