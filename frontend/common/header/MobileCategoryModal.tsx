"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@deep-ecommerce/shared/components/ui/sheet";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

function CategoryNode({
  node,
  depth,
  onNavigate,
}: {
  node: CategoryTreeNode;
  depth: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between gap-2 py-2.5"
        style={{ paddingLeft: depth * 16 }}
      >
        <Link
          href={`/product?category=${node.id}`}
          onClick={onNavigate}
          className="flex-1 text-sm text-foreground"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="rounded-sm p-1 text-muted-foreground hover:bg-muted"
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-4 border-l border-border">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileCategoryModal({
  categories,
  open,
  onOpenChange,
}: {
  categories: CategoryTreeNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-full">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <SheetBody className="overflow-y-auto px-4">
          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No categories found
            </p>
          ) : (
            categories.map((cat) => (
              <CategoryNode
                key={cat.id}
                node={cat}
                depth={0}
                onNavigate={() => onOpenChange(false)}
              />
            ))
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
