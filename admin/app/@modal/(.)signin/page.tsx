import Link from "next/link";
import { Suspense } from "react";

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
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Suspense>
        <SigninForm />
      </Suspense>
    </AuthModal>
  );
}
