"use client";

import * as React from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

export interface ModalSizeConfig {
  default: number;
  min: number;
  max: number;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  resizable?: boolean;
  width?: ModalSizeConfig;
  height?: ModalSizeConfig;
  className?: string;
  resizableClassName?: string;
}

/** Easy centered modal — title/children (/footer) covers the common case
 * (e.g. viewing a record's details) in one import instead of six. For a
 * fully custom layout, use <Dialog>/<DialogContent>/<DialogTitle> etc.
 * directly — this is a convenience layer on top of them, not a
 * replacement, and they stay just as usable on their own. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  resizable,
  width,
  height,
  className,
  resizableClassName,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        resizable={resizable}
        defaultWidth={width?.default}
        minWidth={width?.min}
        maxWidth={width?.max}
        defaultHeight={height?.default}
        minHeight={height?.min}
        maxHeight={height?.max}
        className={className}
        resizableClassName={resizableClassName}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <DialogBody>{children}</DialogBody>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
