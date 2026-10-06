import { redirect } from "next/navigation";

import { getCurrentUser } from "@/providers/auth/session";
import LoginModalClient from "./LoginModalClient";

export default async function LoginModal() {
  // Already signed in — same rule as the non-intercepted /login fallback
  // (app/login/page.tsx): nothing to log in for.
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return <LoginModalClient />;
}
