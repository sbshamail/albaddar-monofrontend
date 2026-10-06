import { redirect } from "next/navigation";

import AuthModal from "@/common/auth/AuthModal";
import { getCurrentUser } from "@/providers/auth/session";

export default async function LoginPage() {
  // Already signed in — there's nothing to log in for, send them on rather
  // than showing the form again.
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-lg border border-border p-6">
        <AuthModal />
      </div>
    </div>
  );
}
