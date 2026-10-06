"use client";

import { useState } from "react";

import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";
import Header from "@/common/header/Header";
import MobileCategoryModal from "@/common/header/MobileCategoryModal";
import Footer from "@/common/layout/Footer";
import MobileBottomNav from "@/common/nav/MobileBottomNav";

/**
 * The mobile category modal is opened from the bottom nav but rendered
 * once for the whole app — this client wrapper is the one place both
 * siblings share that open/close state, since the server RootLayout can't
 * hold it itself.
 */
export default function SiteChrome({
  categories,
  children,
}: {
  categories: CategoryTreeNode[];
  children: React.ReactNode;
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <Header
        categories={categories}
        onOpenCategories={() => setCategoriesOpen(true)}
      />

      <main className="flex-1">{children}</main>

      <Footer />

      <MobileBottomNav onOpenCategories={() => setCategoriesOpen(true)} />
      <MobileCategoryModal
        categories={categories}
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />
    </div>
  );
}
