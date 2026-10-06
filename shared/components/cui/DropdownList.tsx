"use client";
import React, { FC, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import useDivDimensions from "../../hooks/useDivDimensions";
import { cn } from "../../lib/utils";
import { ChildrenType, ClassNameType } from "../../types/common_types";
import { twMerge } from "tailwind-merge";

export interface ContentItem {
  [key: string]: unknown;
  Icon?: React.ElementType;
  title?: string | number;
  click?: () => void;
  className?: ClassNameType;
  contentClass?: ClassNameType;
  contentId?: string;
}
export interface DropdownListProps {
  Trigger?: () => React.ReactNode;
  contents?: ContentItem[];
  children?: ChildrenType;
  contentId?: string;
  contentsWrapClass?: ClassNameType;
  contentClass?: ClassNameType;
  /** When false the popover stays open after an item is clicked (for multi-select). Default: true */
  closeOnSelect?: boolean;
}

export interface ContentListType {
  content: ContentItem;
  contentId?: string;
  contentClass?: ClassNameType;
  onClose?: () => void;
}

export const ContentList: FC<ContentListType> = ({
  content,
  contentClass,
  contentId = "title",
  onClose,
}) => {
  const Icon = content?.Icon;
  const label = content[contentId];

  return (
    <span
      className={twMerge(
        "w-full flex items-center gap-2.5 cursor-pointer px-3 py-2 text-sm",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        contentClass,
        content.className as string,
      )}
      onClick={() => {
        content?.click?.();
        onClose?.();
      }}
    >
      {Icon && (
        <span className="shrink-0 text-muted-foreground flex items-center">
          <Icon size={14} />
        </span>
      )}
      {label != null && (
        <span className="flex-1 whitespace-nowrap">
          {label as React.ReactNode}
        </span>
      )}
    </span>
  );
};

const DropdownList = ({
  Trigger,
  children,
  contents,
  contentClass,
  contentId,
  contentsWrapClass,
  closeOnSelect = true,
}: DropdownListProps) => {
  const [open, setOpen] = useState(false);
  const { dimension, divRef } = useDivDimensions();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* No asChild — PopoverTrigger is the <button>; click always works */}
      <PopoverTrigger
        ref={divRef as unknown as React.Ref<HTMLButtonElement>}
        className="inline-flex items-center justify-center p-1.5 rounded-md
          hover:bg-accent text-muted-foreground hover:text-accent-foreground
          transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {Trigger ? Trigger() : null}
      </PopoverTrigger>
      <PopoverContent
        className={cn("m-0 p-0 max-w-max min-w-40", contentsWrapClass)}
        style={{ minWidth: dimension?.width }}
      >
        <div className="flex flex-col  select-none">
          {children
            ? children
            : contents?.map((content: ContentItem, key: number) => (
                <ContentList
                  key={key}
                  content={content}
                  contentClass={content?.contentClass || contentClass}
                  contentId={content?.contentId || contentId}
                  onClose={closeOnSelect ? () => setOpen(false) : undefined}
                />
              ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DropdownList;
