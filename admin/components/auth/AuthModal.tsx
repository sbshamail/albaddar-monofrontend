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

interface Props {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Renders /signin and /register as an overlay when reached via client-side
// navigation (e.g. a "Sign in" link from a public page), via the app/@modal
// intercepting routes. Direct navigation/refresh still renders the full
// AuthCard page instead — see app/@modal/default.tsx.
const AuthModal = ({ title, description, footer, children }: Props) => {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <div className="text-sm text-muted-foreground">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
