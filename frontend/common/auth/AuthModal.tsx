"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@deep-ecommerce/shared/components/ui/input-otp";
import { fetching } from "@deep-ecommerce/shared/api/client";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { useAuth } from "@/providers/auth/authContext";
import { resolvePendingAuth } from "./requestAuth";

type Mode = "login" | "register";
type Step = "email" | "otp";

const RESEND_COOLDOWN_SECONDS = 30;

export default function AuthModal() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const close = () => router.back();

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep("email");
    setOtp("");
    setError(null);
  };

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetching({
      url: `/api/${mode}-otp/send`,
      method: "POST",
      body: { email: email.trim() },
      showLoader: false,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.detail ?? "Couldn't send the code. Try again.");
      return;
    }
    setStep("otp");
    setCooldown(RESEND_COOLDOWN_SECONDS);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    const res = await fetching({
      url: `/api/auth/${mode}-otp/verify`,
      method: "POST",
      body: { email: email.trim(), otp },
      showLoader: false,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.detail ?? "Invalid or expired code");
      return;
    }
    await refresh();
    resolvePendingAuth();
    close();
  };

  return (
    <div className="flex flex-col gap-5 p-1">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to save your cart and see it on any device — checking out
          requires an account, so we can keep your order safe and let you
          track it later.
        </p>
      </div>

      <div className="flex rounded-md border border-border p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              "flex-1 rounded-sm py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "login" ? "Log in" : "Register"}
          </button>
        ))}
      </div>

      {step === "email" ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <Input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
          </p>
          <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || otp.length !== 6}>
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-muted-foreground hover:text-foreground"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={() => sendOtp()}
              disabled={cooldown > 0 || loading}
              className="text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
