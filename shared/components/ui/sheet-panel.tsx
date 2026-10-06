"use client";

import * as React from "react";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

export interface SheetPanelSizeConfig {
  default: number;
  min: number;
  max: number;
}

export interface SheetPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  resizable?: boolean;
  width?: SheetPanelSizeConfig;
  className?: string;
  resizableClassName?: string;
}

/** Easy side drawer — title/children covers the common case (e.g. a
 * create/edit form) in one import instead of five. For a fully custom
 * layout, use <Sheet>/<SheetContent>/<SheetTitle> etc. directly — this is
 * a convenience layer on top of them, not a replacement, and they stay
 * just as usable on their own. */
export function SheetPanel({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  resizable,
  width,
  className,
  resizableClassName,
}: SheetPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        resizable={resizable}
        defaultWidth={width?.default}
        minWidth={width?.min}
        maxWidth={width?.max}
        className={className}
        resizableClassName={resizableClassName}
      >
        {(title || description) && (
          <SheetHeader>
            <div>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </div>
          </SheetHeader>
        )}
        <SheetBody>{children}</SheetBody>
      </SheetContent>
    </Sheet>
  );
}
