import Link from "next/link";

import RegisterForm from "@/common/form/RegisterForm";
import AuthCard from "@/components/auth/AuthCard";

export default function RegisterPage() {
  return (
    <AuthCard
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
    </AuthCard>
  );
}
