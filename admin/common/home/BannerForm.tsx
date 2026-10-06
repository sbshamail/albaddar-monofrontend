"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { fetching } from "@deep-ecommerce/shared/api/client";
import GradientPicker from "@deep-ecommerce/shared/components/cui/GradientPicker";
import RichTextEditor from "@deep-ecommerce/shared/components/cui/RichTextEditor";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { Switch } from "@deep-ecommerce/shared/components/ui/switch";
import { BannerRead } from "@deep-ecommerce/shared/types/home_types";

import { BannerFormValues, bannerSchema } from "../form/schemas/homeSchemas";
import { isEmptyHtml } from "./homeMeta";

interface BannerFormProps {
  mode: "create" | "update";
  sectionId: number;
  banner?: BannerRead;
  /** The section's width × height, shown as a hint on the preview shape. */
  width?: number | null;
  height?: number | null;
  onSuccess: (banner: BannerRead) => void;
  close: () => void;
}

const BannerForm = ({
  mode,
  sectionId,
  banner,
  width,
  height,
  onSuccess,
  close,
}: BannerFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    banner?.image?.original ?? null,
  );
  // Existing image the admin chose to drop (text-only banner).
  const [removeImage, setRemoveImage] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: banner?.title ?? "",
      content: banner?.content ?? "",
      background: banner?.background ?? "",
      link_url: banner?.link_url ?? "",
      open_in_new_tab: banner?.open_in_new_tab ?? false,
      is_active: banner?.is_active ?? true,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    // The preview is a <label for=file-input> — don't open the picker.
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setPreviewUrl(null);
    setRemoveImage(Boolean(banner?.image));
  };

  const onSubmit = async (v: BannerFormValues) => {
    setServerError(null);
    // Image is optional (text-only banners are fine) — but not all empty.
    if (!previewUrl && isEmptyHtml(v.content) && !v.title.trim()) {
      setServerError("Add an image or some text");
      return;
    }

    // Multipart because of the image. FastAPI treats an EMPTY form string as
    // "not sent", so on update a cleared text field is sent as a single
    // space — the backend trims it to "" and clears the column. (Omitting
    // the key would leave the old value in place.)
    const text = (value: string) =>
      value.trim() || (mode === "update" ? " " : "");
    const fd = new FormData();
    if (mode === "create") fd.append("section_id", String(sectionId));
    fd.append("title", text(v.title));
    fd.append("content", isEmptyHtml(v.content) ? text("") : v.content);
    fd.append("background", text(v.background));
    fd.append("link_url", text(v.link_url));
    fd.append("open_in_new_tab", String(v.open_in_new_tab));
    fd.append("is_active", String(v.is_active));
    if (imageFile) fd.append("image", imageFile);
    else if (removeImage) fd.append("remove_image", "true");

    const res = await fetching<BannerRead>({
      url:
        mode === "create"
          ? "/api/banner/create"
          : `/api/banner/update/${banner?.id}`,
      method: mode === "create" ? "POST" : "PUT",
      body: fd,
    });

    if (!res.ok || !res.data) {
      setServerError(res.detail ?? "Something went wrong");
      return;
    }
    onSuccess(res.data);
    close();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <FormLabel htmlFor="banner-image">Image (optional)</FormLabel>
          <label
            htmlFor="banner-image"
            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-input bg-muted/40 hover:bg-muted"
            style={
              width && height
                ? { aspectRatio: `${width} / ${height}`, maxHeight: 220 }
                : { minHeight: 120, maxHeight: 220 }
            }
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Banner preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <ImagePlus className="size-6" />
                Click to add an image (or leave it text-only)
              </span>
            )}
            {previewUrl && (
              <>
                <span className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Click to replace
                </span>
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={handleRemoveImage}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-100 hover:bg-black/80 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </>
            )}
          </label>
          <input
            id="banner-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
          />
          {width && height && (
            <p className="text-xs text-muted-foreground">
              Section size is {width} × {height}px — images are cropped to fit,
              so use that shape.
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text on banner (optional)</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Headline, offer details…"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Shown in white over the bottom of the image.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background (optional)</FormLabel>
              <FormControl>
                <GradientPicker
                  value={field.value || null}
                  onChange={(css) => field.onChange(css ?? "")}
                  noneLabel="Default — card colour"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Shown behind the image and as the card for text-only banners.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Click action — link (optional)</FormLabel>
              <FormControl>
                <Input placeholder="/product/12  or  https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alt text / label (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Describes the image for screen readers"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 rounded-md border border-border p-3">
          <FormField
            control={form.control}
            name="open_in_new_tab"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <FormLabel>Open link in a new tab</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <FormLabel>Visible on the storefront</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Saving…"
            : mode === "create"
              ? "Add banner"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};

export default BannerForm;
