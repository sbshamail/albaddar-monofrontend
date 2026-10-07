import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

import { siteConfig } from "../site.config";

// This app has no .env* of its own — the workspace shares root-level
// .env/.env.local files (monofrontend/.env, monofrontend/.env.local) for
// both admin and frontend, since they talk to the same backend. Next's own
// env loading (@next/env) only ever looks inside the app's own directory,
// so the root files are otherwise invisible here — BACKEND_API_URL would
// always fall back to shared/api/server.ts's hardcoded default.
// process.loadEnvFile (Node 20.6+) never overrides a var already present in
// process.env, so loading .env.local FIRST is what makes it win over .env —
// same precedence Next itself uses between the two. This runs once, in the
// same process Next's dev/build server keeps alive for its whole lifetime,
// so it populates process.env for every later server-side read (API
// routes, Server Components).
if (typeof process.loadEnvFile === "function") {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.resolve(__dirname, "..", file);
    if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: siteConfig.devOrigins,
  // Workspace package is plain TS/TSX source, not pre-built — this tells
  // Next to run its normal transform on it instead of treating it as
  // opaque, already-compiled node_modules code.
  transpilePackages: ["@deep-ecommerce/shared"],
};

export default nextConfig;
