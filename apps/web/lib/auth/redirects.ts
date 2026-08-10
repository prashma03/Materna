import type { UserRole } from "@/types/database";

export function dashboardPathForRole(role: UserRole) {
  return role === "provider" ? "/doctor/dashboard" : "/patient/dashboard";
}
