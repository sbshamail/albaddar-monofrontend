import Link from "next/link";
import { Suspense } from "react";

import SigninForm from "@/common/form/SigninForm";
import AuthCard from "@/components/auth/AuthCard";

export default function SigninPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Enter your email or phone to access your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Suspense>
        <SigninForm />
      </Suspense>
    </AuthCard>
  );
}
