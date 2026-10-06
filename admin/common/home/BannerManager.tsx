"use client";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { fetching } from "@deep-ecommerce/shared/api/client";
import SortableList from "@deep-ecommerce/shared/components/cui/SortableList";
import { ConfirmDialog } from "@deep-ecommerce/shared/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import {
  parseBackground,
  readableTextOn,
} from "@deep-ecommerce/shared/lib/gradient";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import {
  BannerRead,
  HomeSectionRead,
} from "@deep-ecommerce/shared/types/home_types";
import { removeById, upsertById } from "@/lib/list";

import BannerForm from "./BannerForm";

type FormState =
  | { mode: "create" }
  | { mode: "update"; banner: BannerRead };

interface BannerManagerProps {
  section: HomeSectionRead;
  canEdit: boolean;
  /** Pushes the section's new banner list up to the page state. */
  onChange: (banners: BannerRead[]) => void;
  onError: (message: string | null) => void;
}

const BannerManager = ({
  section,
  canEdit,
  onChange,
  onError,
}: BannerManagerProps) => {
  const { banners } = section;
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BannerRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Same shape the storefront renders, so the admin sees roughly what
  // customers will — falls back to a wide default when no size is set.
  const aspect =
    section.width && section.height
      ? `${section.width} / ${section.height}`
      : "16 / 7";

  const handleReorder = async (from: number, to: number) => {
    const next = [...banners];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next); // optimistic
    const res = await fetching({
      url: `/api/banner/reorder/${section.id}`,
      method: "PUT",
      body: { ids: next.map((b) => b.id) },
      showLoader: false,
    });
    if (!res.ok) {
      onChange(banners); // roll back
      onError(res.detail ?? "Couldn't save the new order");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetching({
      url: `/api/banner/delete/${deleteTarget.id}`,
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      onError(res.detail ?? "Failed to delete banner");
      return;
    }
    onChange(removeById(banners, deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "grid gap-3",
          "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
        )}
      >
        <SortableList
          items={banners}
          onReorder={canEdit ? handleReorder : () => {}}
          strategy={rectSortingStrategy}
          className="contents"
          renderItem={(banner, _i, drag) => (
            <div
              className={cn(
                "group relative overflow-hidden rounded-md border border-border bg-muted",
                !banner.is_active && "opacity-60",
              )}
              style={{ aspectRatio: aspect }}
            >
              {banner.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.image.original}
                  alt={banner.title ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center p-2 text-center text-xs font-medium",
                    !parseBackground(banner.background) && "bg-card text-card-foreground",
                  )}
                  style={
                    parseBackground(banner.background)
                      ? {
                          background: banner.background ?? undefined,
                          color:
                            readableTextOn(banner.background) === "dark"
                              ? "#171717"
                              : "#ffffff",
                        }
                      : undefined
                  }
                >
                  <span className="line-clamp-3">
                    {banner.title ||
                      banner.content?.replace(/<[^>]*>/g, " ").trim() ||
                      "Text banner"}
                  </span>
                </div>
              )}
              {!banner.is_active && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                  <EyeOff className="size-3" /> Hidden
                </span>
              )}
              {canEdit && (
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    className="cursor-grab touch-none rounded p-1 text-white hover:bg-white/20"
                    {...drag.attributes}
                    {...drag.listeners}
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <div className="flex">
                    <button
                      type="button"
                      aria-label="Edit banner"
                      onClick={() => setForm({ mode: "update", banner })}
                      className="rounded p-1 text-white hover:bg-white/20"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete banner"
                      onClick={() => setDeleteTarget(banner)}
                      className="rounded p-1 text-white hover:bg-white/20"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        />

        {canEdit && (
          <button
            type="button"
            onClick={() => setForm({ mode: "create" })}
            className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-muted"
            style={{ aspectRatio: aspect }}
          >
            <Plus className="size-5" />
            Add banner
          </button>
        )}
      </div>

      {banners.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No banners yet — this section stays hidden on the storefront until it
          has at least one visible banner (image and/or text).
        </p>
      )}

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "update" ? "Edit banner" : "Add banner"}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <BannerForm
              mode={form.mode}
              sectionId={section.id}
              banner={form.mode === "update" ? form.banner : undefined}
              width={section.width}
              height={section.height}
              onSuccess={(saved) => {
                onChange(upsertById(banners, saved));
                onError(null);
              }}
              close={() => setForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this banner?"
        description="Its image is removed too. This can't be undone."
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default BannerManager;
