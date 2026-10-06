"use client";

import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Resizable } from "re-resizable";
import * as React from "react";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

// Position/animation only — no width/height — used for the resizable path,
// where size is instead driven by the inner <Resizable> so the fixed,
// centered Content box can simply hug whatever size the drag handles set
// (the centering transform re-centers automatically as size changes).
const dialogPositionClassName = cn(
  "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
  "border border-border bg-background shadow-xl sm:rounded-lg",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
  "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  "duration-200",
);

interface DialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  /** Lets the user drag the right/bottom edges (and corner) to resize.
   * Automatically falls back to the plain responsive layout below the
   * mobile breakpoint — a fixed-pixel resizable box makes no sense on a
   * phone-width screen, so it isn't attempted there. */
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  /** Extra classes for the inner resizable box (padding/gap/etc.) — kept
   * separate from `className`, which stays on the outer positioned box. */
  resizableClassName?: string;
}

function DialogContent({
  className,
  children,
  resizable,
  defaultWidth = 512,
  minWidth = 360,
  maxWidth = 1100,
  defaultHeight = 480,
  minHeight = 240,
  maxHeight = 800,
  resizableClassName,
  ...props
}: DialogContentProps) {
  const isMobile = useIsMobile();
  const [size, setSize] = React.useState({
    width: defaultWidth,
    height: defaultHeight,
  });

  // Whether drag-to-resize is actually active right now — `children` is
  // ALWAYS mounted inside the same <Resizable> below regardless of this;
  // only ITS props/className differ. This used to branch into two
  // structurally different trees (one with <Resizable>, one without),
  // which meant `children` — and everything inside it, e.g. a form's
  // typed-in state — got fully unmounted and remounted the instant
  // `isMobile` flipped mid-session (resizing the browser window across the
  // 768px breakpoint reset any open form). One stable tree shape at all
  // times is what actually fixes that.
  const isResizing = resizable && !isMobile;

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          dialogPositionClassName,
          isResizing
            ? "max-h-[90vh] max-w-[95vw] overflow-hidden"
            : "max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto",
          className,
        )}
        {...props}
      >
        <Resizable
          size={isResizing ? size : undefined}
          minWidth={isResizing ? minWidth : undefined}
          maxWidth={isResizing ? maxWidth : undefined}
          minHeight={isResizing ? minHeight : undefined}
          maxHeight={isResizing ? maxHeight : undefined}
          enable={
            isResizing
              ? { right: true, bottom: true, bottomRight: true }
              : false
          }
          onResize={(_e, _dir, _ref, delta) =>
            setSize((s) => ({
              width: Math.min(
                maxWidth,
                Math.max(minWidth, s.width + delta.width),
              ),
              height: Math.min(
                maxHeight,
                Math.max(minHeight, s.height + delta.height),
              ),
            }))
          }
          handleClasses={
            isResizing
              ? {
                  right: "hover:bg-primary/40 transition-colors",
                  bottom: "hover:bg-primary/40 transition-colors",
                  bottomRight:
                    "hover:bg-primary/40 transition-colors rounded-full",
                }
              : undefined
          }
          handleStyles={
            isResizing
              ? {
                  right: { width: 6, cursor: "col-resize", right: -3 },
                  bottom: { height: 6, cursor: "row-resize", bottom: -3 },
                  bottomRight: {
                    width: 14,
                    height: 14,
                    cursor: "nwse-resize",
                    right: -4,
                    bottom: -4,
                  },
                }
              : undefined
          }
          className={cn(
            "flex flex-col gap-4 p-6",
            isResizing && "h-full max-h-[90vh]",
            resizableClassName,
          )}
        >
          {children}
        </Resizable>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto", className)} {...props} />;
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
