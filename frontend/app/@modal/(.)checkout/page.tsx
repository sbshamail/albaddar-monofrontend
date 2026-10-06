"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import { useIsMobile } from "@deep-ecommerce/shared/hooks/use-mobile";
import OrderForm from "@/common/order/OrderForm";

export default function CheckoutModal() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Same reasoning as the login modal — checkout is a real task with its
  // own form state, not a quick overlay, so mobile gets the same full-page
  // layout the non-intercepted /checkout route falls back to instead of a
  // Dialog.
  if (isMobile) {
    return (
      <div className="mx-auto flex max-w-lg flex-col px-4 py-10">
        <div className="rounded-lg border border-border p-6">
          <OrderForm />
        </div>
      </div>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        <OrderForm />
      </DialogContent>
    </Dialog>
  );
}
