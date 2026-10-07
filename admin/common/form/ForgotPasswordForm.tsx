"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@deep-ecommerce/shared/components/ui/input-otp";

import AuthLink from "@/components/auth/AuthLink";
import {
  forgotPasswordSchema,
  ForgotPasswordValues,
  resetPasswordSchema,
  ResetPasswordValues,
} from "./schemas/authSchemas";

type Step = "email" | "reset" | "done";

const RESEND_SECONDS = 30;

// Two backend calls, in order: POST /auth/otp-send-email?email=… emails a
// 6-digit code (valid 10 min; always answers 200 so it can't be used to probe
// which emails exist), then POST /auth/reset-password verifies it and sets
// the new password.
const ForgotPasswordForm = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  // Seconds until "Resend code" unlocks. A plain countdown (not a timestamp
  // compared against Date.now()) so render stays pure.
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const emailForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", new_password: "", confirm_password: "" },
  });

  const sendOtp = async (address: string) => {
    const res = await fetch(
      `/api/auth/otp-send-email?email=${encodeURIComponent(address)}`,
      { method: "POST" },
    );
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.detail ?? "Could not send the code");
    }
    setSecondsLeft(RESEND_SECONDS);
  };

  const onSendEmail = async (values: ForgotPasswordValues) => {
    setServerError(null);
    const address = values.email.trim().toLowerCase();
    try {
      await sendOtp(address);
      setEmail(address);
      setStep("reset");
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : "Could not send the code",
      );
    }
  };

  const onResend = async () => {
    setServerError(null);
    try {
      await sendOtp(email);
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : "Could not send the code",
      );
    }
  };

  const onReset = async (values: ResetPasswordValues) => {
    setServerError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...values }),
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      setServerError(payload?.detail ?? "Could not reset your password");
      return;
    }
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <p className="text-sm text-foreground">
          Your password has been reset. You can now sign in with the new one.
        </p>
        <Button asChild className="w-full">
          <AuthLink href="/signin">Go to sign in</AuthLink>
        </Button>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
          <div className="flex items-start gap-2 rounded-md bg-primary/10 p-3 text-sm text-foreground">
            <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              If <strong className="break-all">{email}</strong> has an account,
              a 6-digit code is on its way. It&apos;s valid for 10 minutes.
            </span>
          </div>

          <FormField
            control={resetForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="items-center">
                <FormLabel>Verification code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} autoFocus {...field}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={resetForm.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={resetForm.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={resetForm.formState.isSubmitting}
          >
            {resetForm.formState.isSubmitting ? "Resetting…" : "Reset password"}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setStep("email");
              }}
              className="hover:text-foreground"
            >
              Use a different email
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={secondsLeft > 0}
              className="hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {secondsLeft > 0
                ? `Resend code in ${secondsLeft}s`
                : "Resend code"}
            </button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Form {...emailForm}>
      <form
        onSubmit={emailForm.handleSubmit(onSendEmail)}
        className="space-y-4"
      >
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={emailForm.formState.isSubmitting}
        >
          {emailForm.formState.isSubmitting ? "Sending code…" : "Send code"}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
