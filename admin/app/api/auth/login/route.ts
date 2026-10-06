import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@deep-ecommerce/shared/api/server";
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
} from "@/providers/auth/config";
import { decodeJwtExpiry } from "@/providers/auth/session";
import { LoginResponseData, SigninPayload } from "@/types/auth_types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SigninPayload | null;

  if (!body?.identifier || !body?.password) {
    return NextResponse.json(
      { detail: "Identifier and password are required" },
      { status: 400 },
    );
  }

  let data: LoginResponseData;
  try {
    data = await backendFetch<LoginResponseData>("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Login failed";
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
