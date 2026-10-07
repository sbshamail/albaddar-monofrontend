import { Suspense } from "react";

import SigninForm from "@/common/form/SigninForm";
import AuthCard from "@/components/auth/AuthCard";
import AuthLink from "@/components/auth/AuthLink";

export default function SigninPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Enter your email or phone to access your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <AuthLink href="/register" className="text-primary hover:underline">
            Create one
          </AuthLink>
        </>
      }
    >
      <Suspense>
        <SigninForm />
      </Suspense>
    </AuthCard>
  );
}
