import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  children: ReactNode;
  helpText?: string;
};

export function Field({ label, children, helpText }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="mt-1 block">{children}</span>
      {helpText ? (
        <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
          {helpText}
        </span>
      ) : null}
    </label>
  );
}
