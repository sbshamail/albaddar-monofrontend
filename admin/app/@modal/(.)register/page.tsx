
import AuthLink from "@/components/auth/AuthLink";
import AuthModal from "@/components/auth/AuthModal";
import RegisterForm from "@/common/form/RegisterForm";

export default function RegisterModal() {
  return (
    <AuthModal
      size="wide"
      title="Create an account"
      description="Fill in your details to get started"
      footer={
        <>
          Already have an account?{" "}
          <AuthLink href="/signin" className="text-primary hover:underline">
            Sign in
          </AuthLink>
        </>
      }
    >
      <RegisterForm />
    </AuthModal>
  );
}
