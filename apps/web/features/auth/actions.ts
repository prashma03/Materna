"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { authFormSchema, signupFormSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  message: string;
};

const defaultError =
  "We could not complete that request. Check your information and try again.";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = authFormSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? defaultError };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Your session could not be started." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { message: "No Materna profile is linked to this account yet." };
  }

  revalidatePath("/", "layout");
  redirect(dashboardPathForRole(profile.role));
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupFormSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    fullName: formValue(formData, "fullName"),
    role: formValue(formData, "role"),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? defaultError };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return { message: error.message };
  }

  if (!data.user) {
    return {
      message:
        "Account created. Check email confirmation settings before signing in.",
    };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    email: parsed.data.email,
    full_name: parsed.data.fullName,
    role: parsed.data.role,
  });

  if (profileError) {
    return { message: profileError.message };
  }

  if (parsed.data.role === "patient") {
    const { error: patientError } = await supabase.from("patients").insert({
      profile_id: data.user.id,
    });

    if (patientError) {
      return { message: patientError.message };
    }
  } else {
    const { error: providerError } = await supabase.from("providers").insert({
      profile_id: data.user.id,
    });

    if (providerError) {
      return { message: providerError.message };
    }
  }

  revalidatePath("/", "layout");
  redirect(dashboardPathForRole(parsed.data.role));
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
