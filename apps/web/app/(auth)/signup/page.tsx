import { AuthCard } from "@/components/layout/auth-card";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignupPage() {
  return (
    <AuthCard
      description="Create a patient or provider account to test the protected dashboard flow."
      title="Create your Materna account"
    >
      <AuthForm mode="signup" />
    </AuthCard>
  );
}
