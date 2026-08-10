"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthActionState } from "@/features/auth/actions";
import { signIn, signUp } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type AuthFormProps = {
  mode: "login" | "signup";
};

const initialState: AuthActionState = {
  message: "",
};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {mode === "signup" ? (
        <Field label="Full name">
          <Input
            autoComplete="name"
            name="fullName"
            placeholder="Your name"
            required
          />
        </Field>
      ) : null}

      <Field label="Email">
        <Input
          autoComplete="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </Field>

      <Field label="Password">
        <Input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
      </Field>

      {mode === "signup" ? (
        <Field
          helpText="This decides the first protected dashboard after signup."
          label="Role"
        >
          <Select defaultValue="patient" name="role" required>
            <option value="patient">Patient</option>
            <option value="provider">Provider</option>
          </Select>
        </Field>
      ) : null}

      {state.message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={pending} type="submit">
        {pending
          ? "Please wait..."
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </Button>

      <p className="text-center text-sm text-[var(--muted)]">
        {mode === "login" ? "New to Materna?" : "Already have an account?"}{" "}
        <Link
          className="font-semibold text-[var(--primary-strong)]"
          href={mode === "login" ? "/signup" : "/login"}
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
