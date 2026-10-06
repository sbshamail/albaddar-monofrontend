import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@deep-ecommerce/shared/api/server";
import { AuthUser, RegisterPayload } from "@/types/auth_types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RegisterPayload | null;

  if (!body?.email || !body?.password || !body?.full_name) {
    return NextResponse.json({ detail: "Missing required fields" }, { status: 400 });
  }

  try {
    const user = await backendFetch<AuthUser>("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ detail: "Check your email to verify your account", user });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Registration failed";
    return NextResponse.json({ detail }, { status });
  }
}
