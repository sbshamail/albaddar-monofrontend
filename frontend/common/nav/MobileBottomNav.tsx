"use client";

import { Home, LayoutGrid, ShoppingCart, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { requestAuth } from "@/common/auth/requestAuth";
import { useCart } from "@/common/cart/CartProvider";
import { useAuth } from "@/providers/auth/authContext";
import { Badge } from "@deep-ecommerce/shared/components/ui/badge";
import { cn } from "@deep-ecommerce/shared/lib/utils";

export default function MobileBottomNav({
  onOpenCategories,
}: {
  onOpenCategories: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const linkClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
      active ? "text-primary" : "text-muted-foreground",
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden">
      <Link href="/" className={linkClass(pathname === "/")}>
        <Home className="size-5" />
        Home
      </Link>

      <button
        type="button"
        onClick={onOpenCategories}
        className={linkClass(false)}
      >
        <LayoutGrid className="size-5" />
        Categories
      </button>

      <Link
        href="/cart"
        className={cn(linkClass(pathname === "/cart"), "relative")}
      >
        <ShoppingCart className="size-5" />
        Cart
        {totalItems > 0 && (
          <Badge className="absolute right-3 top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[9px]">
            {totalItems}
          </Badge>
        )}
      </Link>

      {isAuthenticated ? (
        <Link href="/account" className={linkClass(pathname === "/account")}>
          <User className="size-5" />
          Account
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => requestAuth(router)}
          className={linkClass(false)}
        >
          <User className="size-5" />
          Sign in
        </button>
      )}
      <Link
        href="/product"
        className={cn(linkClass(pathname === "/product"), "relative")}
      >
        <Store className="size-5" />
        Shop
      </Link>
      {/* <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass(false)}
      >
        <MessageCircle className="size-5" />
        WhatsApp
      </a> */}
    </nav>
  );
}
