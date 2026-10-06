"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { requestAuth } from "@/common/auth/requestAuth";
import { useAuth } from "@/providers/auth/authContext";
import ToggleMode from "@deep-ecommerce/shared/components/cui/themeToggle/ToggleMode";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@deep-ecommerce/shared/components/ui/sheet";

const PAGE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contactus", label: "Contact" },
];

export default function MobilePageMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-1 px-4 py-2">
          {PAGE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onOpenChange(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t border-border" />

          {isAuthenticated ? (
            <Link
              href="/account"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <User className="size-4" />
              Account
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                requestAuth(router);
              }}
              className="flex items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted"
            >
              <User className="size-4" />
              Sign in
            </button>
          )}

          <div className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium text-foreground">
            Theme
            <ToggleMode />
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
