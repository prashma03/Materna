import { AuthCard } from "@/components/layout/auth-card";
import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <AuthCard
      description="Log in with a real account. Role-based routing happens after Supabase confirms your session."
      title="Welcome back"
    >
      <AuthForm mode="login" />
    </AuthCard>
  );
}
