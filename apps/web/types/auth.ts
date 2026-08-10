import type { UserRole } from "@/types/database";

export type AuthenticatedProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};
