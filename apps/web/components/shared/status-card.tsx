import type { ReactNode } from "react";

type StatusCardProps = {
  title: string;
  value: string;
  detail: string;
  children?: ReactNode;
};

export function StatusCard({ title, value, detail, children }: StatusCardProps) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
      <p className="mt-3 text-3xl font-black text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}
