import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout subtitle="Create your BrewedMinds account to start chatting">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/chat"
      />
    </AuthLayout>
  );
}
