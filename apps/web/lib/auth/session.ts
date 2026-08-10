import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatedProfile } from "@/types/auth";
import type { UserRole } from "@/types/database";

export async function getCurrentProfile(): Promise<AuthenticatedProfile | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== role) {
    redirect(profile.role === "provider" ? "/doctor/dashboard" : "/patient/dashboard");
  }

  return profile;
}
