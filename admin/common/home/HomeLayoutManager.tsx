"use client";
import { GripVertical, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { fetching } from "@deep-ecommerce/shared/api/client";
import SortableList from "@deep-ecommerce/shared/components/cui/SortableList";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { ConfirmDialog } from "@deep-ecommerce/shared/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@deep-ecommerce/shared/components/ui/dialog";
import { Switch } from "@deep-ecommerce/shared/components/ui/switch";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import {
  BannerRead,
  HomeSectionRead,
} from "@deep-ecommerce/shared/types/home_types";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";
import { removeById, upsertById } from "@/lib/list";
import { useAuth } from "@/providers/auth/authContext";

import BannerManager from "./BannerManager";
import { getSectionMeta } from "./homeMeta";
import SectionForm from "./SectionForm";

type FormState =
  | { mode: "create" }
  | { mode: "update"; section: HomeSectionRead };

interface HomeLayoutManagerProps {
  sections: HomeSectionRead[];
  categories: CategoryTreeNode[];
  loadError?: string | null;
}

const findCategoryName = (
  nodes: CategoryTreeNode[],
  id: number | null,
): string | null => {
  if (id == null) return null;
  for (const n of nodes) {
    if (n.id === id) return n.name;
    const found = findCategoryName(n.children, id);
    if (found) return found;
  }
  return null;
};

function summarize(
  s: HomeSectionRead,
  categories: CategoryTreeNode[],
): string {
  const parts: string[] = [];
  if (s.type === "banner_row") parts.push(`${s.columns ?? 4} per row`);
  if (s.width && s.height) parts.push(`${s.width}×${s.height}px`);
  if (getSectionMeta(s.type).usesBanners) {
    parts.push(`${s.banners.length} banner${s.banners.length === 1 ? "" : "s"}`);
  }
  if (s.product_limit) parts.push(`${s.product_limit} items`);
  const cat = findCategoryName(categories, s.category_id);
  if (cat) parts.push(cat);
  if (s.full_width) parts.push("full width");
  return parts.join(" · ");
}

const HomeLayoutManager = ({
  sections: initial,
  categories,
  loadError,
}: HomeLayoutManagerProps) => {
  const { can } = useAuth();
  const canEdit = can("homepage:manage");

  // Resync when the server hands us a fresh list (render-time adjustment,
  // not an effect — see monofrontend/AGENTS.md).
  const [prevInitial, setPrevInitial] = useState(initial);
  const [sections, setSections] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setSections(initial);
  }

  const [prevLoadError, setPrevLoadError] = useState(loadError);
  const [error, setError] = useState(loadError ?? null);
  if (loadError !== prevLoadError) {
    setPrevLoadError(loadError);
    setError(loadError ?? null);
  }

  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HomeSectionRead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const patchSection = (id: number, patch: Partial<HomeSectionRead>) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );

  const handleReorder = async (from: number, to: number) => {
    const before = sections;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSections(next); // optimistic
    const res = await fetching({
      url: "/api/home-section/reorder",
      method: "PUT",
      body: { ids: next.map((s) => s.id) },
      showLoader: false,
    });
    if (!res.ok) {
      setSections(before);
      setError(res.detail ?? "Couldn't save the new order");
    }
  };

  const handleToggle = async (section: HomeSectionRead, active: boolean) => {
    patchSection(section.id, { is_active: active }); // optimistic
    const res = await fetching({
      url: `/api/home-section/update/${section.id}`,
      method: "PUT",
      body: { is_active: active },
      showLoader: false,
    });
    if (!res.ok) {
      patchSection(section.id, { is_active: !active });
      setError(res.detail ?? "Couldn't update the section");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetching({
      url: `/api/home-section/delete/${deleteTarget.id}`,
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) {
      setError(res.detail ?? "Failed to delete section");
      setDeleteTarget(null);
      return;
    }
    setSections((prev) => removeById(prev, deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <LayoutTemplate size={18} className="text-primary" />
            Homepage layout
          </h1>
          <p className="text-sm text-muted-foreground">
            Sections appear on the storefront top to bottom. Drag to reorder,
            switch off to hide.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setForm({ mode: "create" })}>
            <Plus className="size-4" /> Add section
          </Button>
        )}
      </div>

      {sections.length === 0 && !loadError ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No sections yet. The storefront falls back to its default layout
          until you add one.
        </p>
      ) : (
        <SortableList
          items={sections}
          onReorder={canEdit ? handleReorder : () => {}}
          className="space-y-3"
          renderItem={(section, index, drag) => {
            const meta = getSectionMeta(section.type);
            const Icon = meta.icon;
            return (
              <div
                className={cn(
                  "rounded-lg border border-border bg-card p-3 shadow-xs",
                  !section.is_active && "bg-muted/40",
                )}
              >
                <div className="flex items-center gap-3">
                  {canEdit && (
                    <button
                      type="button"
                      aria-label="Drag to reorder"
                      className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted"
                      {...drag.attributes}
                      {...drag.listeners}
                    >
                      <GripVertical className="size-4" />
                    </button>
                  )}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        !section.is_active && "text-muted-foreground",
                      )}
                    >
                      {index + 1}. {meta.label}
                      {section.title && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          — {section.title}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {summarize(section, categories) || meta.description}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Switch
                        aria-label={
                          section.is_active ? "Hide section" : "Show section"
                        }
                        checked={section.is_active}
                        onCheckedChange={(v) => handleToggle(section, v)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit section"
                        onClick={() => setForm({ mode: "update", section })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete section"
                        onClick={() => setDeleteTarget(section)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                {meta.usesBanners && (
                  <div className="mt-3 border-t border-border pt-3">
                    <BannerManager
                      section={section}
                      canEdit={canEdit}
                      onChange={(banners: BannerRead[]) =>
                        patchSection(section.id, { banners })
                      }
                      onError={setError}
                    />
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form?.mode === "update" ? "Edit section" : "Add section"}
            </DialogTitle>
          </DialogHeader>
          {form && (
            <SectionForm
              mode={form.mode}
              section={form.mode === "update" ? form.section : undefined}
              categories={categories}
              onSuccess={(saved) => {
                setSections((prev) =>
                  upsertById(prev, {
                    ...saved,
                    // Create/update responses omit nothing, but keep the
                    // locally-managed banner list for an edited section.
                    banners:
                      form.mode === "update"
                        ? form.section.banners
                        : saved.banners,
                  }),
                );
                setError(null);
              }}
              close={() => setForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this section?"
        description={
          deleteTarget && getSectionMeta(deleteTarget.type).usesBanners
            ? "All of its banners and their images are deleted too. This can't be undone."
            : "The section is removed from the homepage. This can't be undone."
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};

export default HomeLayoutManager;
