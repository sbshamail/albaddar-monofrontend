"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@deep-ecommerce/shared/components/ui/sheet";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";
import ShopFilters from "./ShopFilters";

export default function MobileFilterSheet({ categories }: { categories: CategoryTreeNode[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 md:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <SheetBody className="overflow-y-auto">
          <ShopFilters categories={categories} onApplied={() => setOpen(false)} />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
