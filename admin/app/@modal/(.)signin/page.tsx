import { Suspense } from "react";

import AuthLink from "@/components/auth/AuthLink";
import AuthModal from "@/components/auth/AuthModal";
import SigninForm from "@/common/form/SigninForm";

export default function SigninModal() {
  return (
    <AuthModal
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
    </AuthModal>
  );
}
