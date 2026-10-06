"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import { useIsMobile } from "@deep-ecommerce/shared/hooks/use-mobile";
import AuthModal from "@/common/auth/AuthModal";

export default function LoginModalClient() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // A centered dialog is the wrong shape for a small screen — signing in is
  // effectively its own task there, not a quick aside over the page behind
  // it, so mobile gets the exact same full-page layout the non-intercepted
  // /login route falls back to (see app/login/page.tsx) instead of a Dialog.
  if (isMobile) {
    return (
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-lg border border-border p-6">
          <AuthModal />
        </div>
      </div>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Sign in or register</DialogTitle>
        <AuthModal />
      </DialogContent>
    </Dialog>
  );
}
