"use client";

import { useRouter } from "next/navigation";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import { cn } from "@deep-ecommerce/shared/lib/utils";

interface Props {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** "wide" for longer forms (register). */
  size?: "default" | "wide";
}

// Renders /signin and /register as an overlay when reached via client-side
// navigation (e.g. a "Sign in" link from a public page), via the app/@modal
// intercepting routes. Direct navigation/refresh still renders the full
// AuthCard page instead — see app/@modal/default.tsx.
const AuthModal = ({
  title,
  description,
  footer,
  children,
  size = "default",
}: Props) => {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent
        className={cn(
          "max-h-[90svh] overflow-y-auto",
          size === "wide" ? "max-w-lg" : "max-w-sm",
        )}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && (
          <div className="border-t pt-4 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
