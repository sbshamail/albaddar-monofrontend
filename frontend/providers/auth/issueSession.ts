import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@deep-ecommerce/shared/api/server";
import { OtpVerifyResponseData } from "@/types/auth_types";

import { ACCESS_TOKEN_COOKIE, DEFAULT_TOKEN_MAX_AGE, REFRESH_TOKEN_COOKIE } from "./config";
import { decodeJwtExpiry } from "./session";

/**
 * Shared by both OTP-verify BFF routes (register and login) — same backend
 * response shape (issue_login_tokens on the backend serves both), same
 * cookie-issuing behavior. Mirrors admin/app/api/auth/login/route.ts: the
 * access/refresh tokens never reach client JS, only `{ user }` does.
 */
export async function verifyOtpAndIssueSession(
  backendPath: string,
  body: { email?: string; otp?: string } | null,
): Promise<NextResponse> {
  if (!body?.email || !body?.otp) {
    return NextResponse.json({ detail: "Email and code are required" }, { status: 400 });
  }

  let data: OtpVerifyResponseData;
  try {
    data = await backendFetch<OtpVerifyResponseData>(backendPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Verification failed";
    return NextResponse.json({ detail }, { status });
  }

  const res = NextResponse.json({ user: data.user });

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  const accessExp = decodeJwtExpiry(data.access_token);
  const accessMaxAge = accessExp
    ? Math.max(accessExp - Math.floor(Date.now() / 1000), 60)
    : DEFAULT_TOKEN_MAX_AGE;

  res.cookies.set(ACCESS_TOKEN_COOKIE, data.access_token, {
    ...cookieOpts,
    maxAge: accessMaxAge,
  });

  if (data.refresh_token) {
    res.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
      ...cookieOpts,
      maxAge: DEFAULT_TOKEN_MAX_AGE,
    });
  }

  return res;
}
