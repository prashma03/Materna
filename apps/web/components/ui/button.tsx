import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  asChild?: false;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  asChild: true;
};

const baseClass =
  "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-strong)]",
  secondary:
    "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--panel-soft)]",
  ghost: "text-[var(--primary-strong)] hover:bg-[var(--primary-soft)]",
};

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "primary";
  const className = [baseClass, variants[variant], props.className]
    .filter(Boolean)
    .join(" ");

  if (props.asChild) {
    const { asChild, variant: _variant, className: _className, ...linkProps } = props;
    void asChild;
    void _variant;
    void _className;

    return <Link {...linkProps} className={className} />;
  }

  const { variant: _variant, className: _className, ...buttonProps } = props;
  void _variant;
  void _className;

  return <button {...buttonProps} className={className} />;
}
