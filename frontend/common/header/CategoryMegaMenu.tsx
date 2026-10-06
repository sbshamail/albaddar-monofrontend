"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@deep-ecommerce/shared/components/ui/popover";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

export default function CategoryMegaMenu({ categories }: { categories: CategoryTreeNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(categories[0]?.id ?? null);
  const active = categories.find((cat) => cat.id === activeId) ?? null;

  if (!categories.length) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Menu className="size-4" />
          All Categories
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[720px] max-w-[90vw] flex-row gap-0 p-0">
        <div className="w-48 shrink-0 border-r border-border py-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onMouseEnter={() => setActiveId(cat.id)}
              onClick={() => setActiveId(cat.id)}
              className={cn(
                "block w-full px-4 py-2 text-left text-sm hover:bg-muted",
                activeId === cat.id && "bg-muted font-medium text-primary",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid max-h-[420px] flex-1 grid-cols-3 gap-4 overflow-y-auto p-4">
          {active?.children.length ? (
            active.children.map((sub) => (
              <div key={sub.id}>
                <Link
                  href={`/product?category=${sub.id}`}
                  onClick={() => setOpen(false)}
                  className="mb-2 block text-sm font-semibold text-foreground hover:text-primary"
                >
                  {sub.name}
                </Link>
                <ul className="space-y-1.5">
                  {sub.children.map((leaf) => (
                    <li key={leaf.id}>
                      <Link
                        href={`/product?category=${leaf.id}`}
                        onClick={() => setOpen(false)}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {leaf.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : active ? (
            <Link
              href={`/product?category=${active.id}`}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              View all {active.name}
            </Link>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
