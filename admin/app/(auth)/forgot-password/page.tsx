
import ForgotPasswordForm from "@/common/form/ForgotPasswordForm";
import AuthLink from "@/components/auth/AuthLink";
import AuthCard from "@/components/auth/AuthCard";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      description="We'll email you a 6-digit code to reset it"
      footer={
        <>
          Remembered it?{" "}
          <AuthLink href="/signin" className="text-primary hover:underline">
            Back to sign in
          </AuthLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
