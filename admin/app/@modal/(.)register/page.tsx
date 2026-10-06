import Link from "next/link";

import AuthModal from "@/components/auth/AuthModal";
import RegisterForm from "@/common/form/RegisterForm";

export default function RegisterModal() {
  return (
    <AuthModal
      title="Create an account"
      description="Fill in your details to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthModal>
  );
}
