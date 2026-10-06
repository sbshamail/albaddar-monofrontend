"use client";

import { LayoutGrid, Menu, Settings, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { requestAuth } from "@/common/auth/requestAuth";
import { useCart } from "@/common/cart/CartProvider";
import { useAuth } from "@/providers/auth/authContext";
import ToggleMode from "@deep-ecommerce/shared/components/cui/themeToggle/ToggleMode";
import { Badge } from "@deep-ecommerce/shared/components/ui/badge";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";
import Image from "next/image";
import logo from "../../../shared/public/images/logo.jpeg";
import CategoryMegaMenu from "./CategoryMegaMenu";
import MobilePageMenu from "./MobilePageMenu";
import SearchBar from "./SearchBar";

export default function Header({
  categories,
  onOpenCategories,
}: {
  categories: CategoryTreeNode[];
  onOpenCategories: () => void;
}) {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pageMenuOpen, setPageMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="hidden bg-primary py-1.5 text-center text-xs text-primary-foreground md:block  ">
        <div className="max-w-7xl m-auto relative">
          Welcome to Market — Free shipping over 2000 Rs! &nbsp;
          <div className="absolute right-2 top-1/2 -translate-y-1/2 ">
            <ToggleMode />
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl items-center gap-4 px-4 py-3 md:flex">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-t-full rounded-y-4xl inset-shadow-xs inset-shadow-primary shadow shadow-primary bg-white  transition-all hover:scale-105 hover:shadow-lg  "
        >
          <Image src={logo} width={70} height={70} alt="AlBaddar logo" />
        </Link>

        <div className="hidden md:block">
          <CategoryMegaMenu categories={categories} />
        </div>

        <SearchBar className="hidden flex-1 md:flex" />

        <nav className="ml-auto hidden items-center gap-4 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/product" className="hover:text-primary">
            Shop
          </Link>
          <Link href="/about" className="hover:text-primary">
            About
          </Link>
          <Link href="/contactus" className="hover:text-primary">
            Contact
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative hidden md:inline-flex"
            >
              <Link href="/account" aria-label="Account settings">
                <User className="size-5" />
                <Settings className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-background text-muted-foreground" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => requestAuth(router)}
              aria-label="Sign in"
            >
              <User className="size-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="size-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCategories}
          aria-label="Open categories"
        >
          <LayoutGrid className="size-5" />
        </Button>

        <Link href="/" className="flex shrink-0 items-center">
          <Image src={logo} width={40} height={40} alt="AlBaddar logo" />
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPageMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <div className="border-border px-4 pb-3 md:hidden">
        <SearchBar />
      </div>

      <MobilePageMenu open={pageMenuOpen} onOpenChange={setPageMenuOpen} />
    </header>
  );
}
