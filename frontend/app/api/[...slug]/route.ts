import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getAccessToken } from "@/providers/auth/session";
import {
  BACKEND_API_URL,
  backendEnvelope,
} from "@deep-ecommerce/shared/api/server";

/**
 * Generic pass-through proxy: /api/<slug> → FastAPI's /<slug>, same method,
 * same body, same query string. Mirrors admin's app/api/[...slug]/route.ts
 * pattern, including the auth-token attach step (added once this app grew a
 * real session — public product/category browsing never needed it, but
 * cart/order/address/user do). Auth is still enforced by the backend
 * per-endpoint; this just attaches the token when one exists.
 *
 * A more specific file (e.g. app/api/cart/route.ts) always wins over this
 * catch-all for the same path — plain Next.js routing — so a resource that
 * ever needs custom behavior just gets its own route.ts next to this one.
 */
async function proxy(request: NextRequest, slugParts: string[]) {
  const [resource, ...rest] = slugParts;
  const backendPath = `/${resource}${rest.length ? `/${rest.join("/")}` : ""}${request.nextUrl.search}`;

  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const hasBody = !["GET", "HEAD"].includes(request.method);
  if (hasBody) {
    const contentType = request.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;
  }

  try {
    const { status, envelope } = await backendEnvelope(
      backendPath,
      {
        method: request.method,
        headers,
        body: hasBody ? await request.blob() : undefined,
      },
      BACKEND_API_URL,
    );
    return NextResponse.json(envelope, { status });
  } catch {
    console.error("Failed to reach backend", { backendPath });
    return NextResponse.json(
      { detail: "Failed to reach backend" },
      { status: 502 },
    );
  }
}

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
