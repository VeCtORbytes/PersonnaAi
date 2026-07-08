import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout subtitle="Sign in to your BrewedMinds account">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/chat"
      />
    </AuthLayout>
  );
}
