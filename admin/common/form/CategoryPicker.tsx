"use client";
import { Check, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

interface CategoryPickerProps {
  categories: CategoryTreeNode[];
  value: number | null;
  onChange: (id: number | null, node: CategoryTreeNode | null) => void;
  /** Product assignment requires a leaf (backend rejects non-leaf category_id).
   * Category-parent selection allows any node except level 3 (it can't have
   * children, so it can't be a parent). Defaults to leaf-only. */
  leafOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// Backend caps categories at 3 levels (fn.py's calculate_category_level) —
// a level-3 node can never have children, so it can't be picked as a parent.
const MAX_LEVEL = 3;

function findPath(
  nodes: CategoryTreeNode[],
  id: number | null,
): CategoryTreeNode[] {
  if (id == null) return [];
  for (const node of nodes) {
    if (node.id === id) return [node];
    const childPath = findPath(node.children, id);
    if (childPath.length) return [node, ...childPath];
  }
  return [];
}

const CategoryPicker = ({
  categories,
  value,
  onChange,
  leafOnly = true,
  placeholder = "Select a category",
  disabled,
}: CategoryPickerProps) => {
  const [open, setOpen] = useState(false);
  const selectedPath = findPath(categories, value);
  const [activePath, setActivePath] = useState<CategoryTreeNode[]>(selectedPath);

  // Re-seed the picker's expanded rows from the current value each time it opens.
  useEffect(() => {
    if (open) setActivePath(findPath(categories, value));
  }, [open, categories, value]);

  const rows: CategoryTreeNode[][] = [categories];
  activePath.forEach((node) => {
    if (node.children.length > 0) rows.push(node.children);
  });

  const pick = (node: CategoryTreeNode, rowIndex: number) => {
    const nextPath = [...activePath.slice(0, rowIndex), node];
    if (node.children.length === 0) {
      onChange(node.id, node);
      setOpen(false);
      return;
    }
    // Non-leaf: expanding just reveals the next row. "Use this" (the check
    // button) is what actually confirms a non-leaf pick when leafOnly=false.
    setActivePath(nextPath);
  };

  const confirmNonLeaf = (node: CategoryTreeNode) => {
    onChange(node.id, node);
    setOpen(false);
  };

  const breadcrumb = selectedPath.map((n) => n.name).join(" > ");

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="h-9 w-full justify-start truncate font-normal"
        onClick={() => setOpen(true)}
      >
        {breadcrumb || <span className="text-muted-foreground">{placeholder}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select a category</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {!leafOnly && (
              <button
                type="button"
                className={cn(
                  "rounded-md border px-2.5 py-1 text-sm",
                  value == null
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-accent",
                )}
                onClick={() => {
                  onChange(null, null);
                  setOpen(false);
                }}
              >
                No parent (top level)
              </button>
            )}
            {rows.map((row, rowIndex) => {
              const level = rowIndex + 1;
              const selectedAtRow = activePath[rowIndex];
              return (
                <div key={rowIndex} className="flex flex-wrap gap-1.5">
                  {row.map((node) => {
                    const isSelected = selectedAtRow?.id === node.id;
                    const isLeaf = node.children.length === 0;
                    const canConfirmHere = !leafOnly && !isLeaf && level < MAX_LEVEL;
                    return (
                      <div
                        key={node.id}
                        className={cn(
                          "flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:bg-accent",
                        )}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1"
                          onClick={() => pick(node, rowIndex)}
                        >
                          {node.name}
                          {!isLeaf && <ChevronRight size={14} />}
                        </button>
                        {canConfirmHere && (
                          <button
                            type="button"
                            title="Use this category"
                            className="rounded p-0.5 hover:bg-primary/20"
                            onClick={() => confirmNonLeaf(node)}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoryPicker;
