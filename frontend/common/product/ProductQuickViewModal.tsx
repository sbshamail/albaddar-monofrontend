"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import { useIsMobile } from "@deep-ecommerce/shared/hooks/use-mobile";

export default function ProductQuickViewModal({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Quick view is a condensed preview meant to sit over the page behind it
  // — there's no "full page" version of that same compact content to fall
  // back to, so on mobile (where a dialog is the wrong shape entirely) the
  // right full-page equivalent is just the real product page, same as what
  // app/product/[id]/view/page.tsx's own fallback already redirects to for
  // a direct/no-JS hit on this URL.
  useEffect(() => {
    if (isMobile) router.replace(`/product/${productId}`);
  }, [isMobile, productId, router]);

  if (isMobile) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle className="sr-only">Product quick view</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}
