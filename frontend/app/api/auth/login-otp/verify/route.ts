import type { NextRequest } from "next/server";

import { verifyOtpAndIssueSession } from "@/providers/auth/issueSession";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  return verifyOtpAndIssueSession("/login-otp/verify", body);
}
