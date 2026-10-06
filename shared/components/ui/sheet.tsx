"use client";

import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { Resizable } from "re-resizable";
import * as React from "react";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

const sheetVariants = cva(
  [
    "fixed z-50 flex flex-col gap-0 bg-background shadow-xl",
    "transition ease-in-out",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
  ].join(" "),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
);

// Position/border/animation only — no width — used for the resizable path,
// where width is instead driven by the inner <Resizable> so the fixed
// Content box can simply hug whatever width the drag handle sets.
const sheetPositionVariants = cva(
  [
    "fixed z-50 flex flex-col gap-0 bg-background shadow-xl",
    "transition ease-in-out",
    "data-[state=closed]:duration-300 data-[state=open]:duration-500",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
  ].join(" "),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
      },
    },
    defaultVariants: { side: "right" },
  },
);

interface SheetContentProps
  extends
    React.ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  /** Lets the user drag an edge to resize (only meaningful for side="left"/"right").
   * Automatically falls back to the plain responsive layout below the
   * mobile breakpoint — a fixed-pixel resizable width makes no sense on a
   * phone-width screen, so it isn't attempted there. */
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Extra classes for the inner resizable box (padding/gap/etc.) — kept
   * separate from `className`, which stays on the outer positioned box. */
  resizableClassName?: string;
}

function SheetContent({
  side = "right",
  className,
  children,
  resizable,
  defaultWidth = 384,
  minWidth = 320,
  maxWidth = 960,
  resizableClassName,
  ...props
}: SheetContentProps) {
  const isMobile = useIsMobile();
  const [width, setWidth] = React.useState(defaultWidth);
  // SheetContent is one persisted component instance reused across every
  // action item opened into it (Edit, Create, ...) — a useState initializer
  // only runs on this instance's first-ever mount, so switching to an item
  // with a different defaultWidth later wouldn't otherwise take effect.
  // Adjusted during render (not an effect) per React's "adjusting state on
  // prop change" pattern — avoids an extra render pass.
  const [prevDefaultWidth, setPrevDefaultWidth] = React.useState(defaultWidth);
  if (defaultWidth !== prevDefaultWidth) {
    setPrevDefaultWidth(defaultWidth);
    setWidth(defaultWidth);
  }

  // Whether drag-to-resize is actually active right now — `children` is
  // ALWAYS mounted inside the same <Resizable> below regardless of this;
  // only ITS props/className differ. This used to branch into two
  // structurally different trees (one with <Resizable>, one without),
  // which meant `children` — and everything inside it, e.g. a form's
  // typed-in state — got fully unmounted and remounted the instant
  // `isMobile` flipped mid-session (resizing the browser window across the
  // 768px breakpoint reset any open form). One stable tree shape at all
  // times is what actually fixes that.
  const isResizing =
    resizable && !isMobile && (side === "left" || side === "right");
  const resizeEdge = side === "right" ? "left" : "right";

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          isResizing
            ? cn(
                sheetPositionVariants({ side }),
                "max-w-[100vw] overflow-hidden",
              )
            : sheetVariants({ side }),
          className,
        )}
        {...props}
      >
        <Resizable
          size={isResizing ? { width, height: "100%" } : undefined}
          minWidth={isResizing ? minWidth : undefined}
          maxWidth={isResizing ? maxWidth : undefined}
          enable={
            isResizing
              ? { left: resizeEdge === "left", right: resizeEdge === "right" }
              : false
          }
          onResize={(_e, _dir, _ref, delta) =>
            setWidth((w) =>
              Math.min(maxWidth, Math.max(minWidth, w + delta.width)),
            )
          }
          handleClasses={
            isResizing
              ? { [resizeEdge]: "hover:bg-primary/40 transition-colors" }
              : undefined
          }
          handleStyles={
            isResizing
              ? {
                  [resizeEdge]: {
                    width: 6,
                    cursor: "col-resize",
                    [resizeEdge]: -3,
                  },
                }
              : undefined
          }
          className={cn("flex h-full max-w-full flex-col", resizableClassName)}
        >
          {children}
        </Resizable>
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
