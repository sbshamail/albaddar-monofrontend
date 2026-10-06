"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { fetching } from "@deep-ecommerce/shared/api/client";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@deep-ecommerce/shared/components/ui/native-select";
import { Switch } from "@deep-ecommerce/shared/components/ui/switch";
import {
  HomeSectionRead,
  HomeSectionType,
} from "@deep-ecommerce/shared/types/home_types";
import { CategoryTreeNode } from "@deep-ecommerce/shared/types/product_types";

import CategoryPicker from "../form/CategoryPicker";
import {
  SectionFormValues,
  sectionSchema,
} from "../form/schemas/homeSchemas";
import { getSectionMeta, SECTION_TYPES } from "./homeMeta";

interface SectionFormProps {
  mode: "create" | "update";
  section?: HomeSectionRead;
  categories: CategoryTreeNode[];
  onSuccess: (section: HomeSectionRead) => void;
  close: () => void;
}

const str = (n: number | null | undefined) => (n == null ? "" : String(n));

const SectionForm = ({
  mode,
  section,
  categories,
  onSuccess,
  close,
}: SectionFormProps) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      type: section?.type ?? "banner_row",
      title: section?.title ?? "",
      width: str(section?.width),
      height: str(section?.height),
      // A banner row defaults to the four-in-a-row the layout is built for.
      columns: str(section?.columns ?? (section ? null : 4)),
      product_limit: str(section?.product_limit),
      category_id: str(section?.category_id),
      full_width: section?.full_width ?? false,
      autoplay: section?.autoplay ?? true,
      is_active: section?.is_active ?? true,
    },
  });

  const type = useWatch({ control: form.control, name: "type" }) as HomeSectionType;
  const meta = getSectionMeta(type);
  const { fields } = meta;

  // Empty numeric input → null, which the backend treats as "clear it"
  // (an omitted key means "leave unchanged"; on create null is just unset).
  const num = (v: string) => (v === "" ? null : Number(v));

  const onSubmit = async (v: SectionFormValues) => {
    setServerError(null);
    // Plain JSON body (no file → no multipart). Only settings this section
    // type actually uses are sent; `undefined` keys are dropped by
    // JSON.stringify, so the rest stay untouched on update.
    const settings = {
      title: fields.title ? v.title.trim() || null : undefined,
      width: fields.size ? num(v.width) : undefined,
      height: fields.size ? num(v.height) : undefined,
      columns: fields.columns ? num(v.columns) : undefined,
      product_limit: fields.productLimit ? num(v.product_limit) : undefined,
      category_id: fields.category ? num(v.category_id) : undefined,
      full_width: fields.fullWidth ? v.full_width : undefined,
      autoplay: fields.autoplay ? v.autoplay : undefined,
      is_active: v.is_active,
    };
    const res = await fetching<HomeSectionRead>({
      url:
        mode === "create"
          ? "/api/home-section/create"
          : `/api/home-section/update/${section?.id}`,
      method: mode === "create" ? "POST" : "PUT",
      body: mode === "create" ? { type: v.type, ...settings } : settings,
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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section type</FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  disabled={mode === "update"}
                  className="w-full"
                >
                  {SECTION_TYPES.map((t) => (
                    <NativeSelectOption key={t.value} value={t.value}>
                      {t.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormDescription>{meta.description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {fields.title && (
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heading (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Shown above the section" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {fields.size && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner width (px)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="Auto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner height (px)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="Auto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Applies to every banner in this section so they stay uniform. It
              sets the banner&apos;s shape — on smaller screens banners scale
              down proportionally. Leave blank for automatic sizing.
            </p>
          </div>
        )}

        {fields.columns && (
          <FormField
            control={form.control}
            name="columns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banners per row</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" placeholder="4" {...field} />
                </FormControl>
                <FormDescription>
                  Desktop value (1–6). Phones show two per row, or one when
                  there&apos;s only one column.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {fields.productLimit && (
          <FormField
            control={form.control}
            name="product_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {type === "hero" ? "Number of slides" : "Number of products"}
                </FormLabel>
                <FormControl>
                  <Input inputMode="numeric" placeholder="Default" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {fields.category && (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoryPicker
                    categories={categories}
                    value={field.value ? Number(field.value) : null}
                    onChange={(id) => field.onChange(id ? String(id) : "")}
                    leafOnly={false}
                    placeholder="All categories"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-3 rounded-md border border-border p-3">
          {fields.fullWidth && (
            <ToggleField
              form={form}
              name="full_width"
              label="Full width"
              hint="Stretch edge to edge instead of staying inside the page width."
            />
          )}
          {fields.autoplay && (
            <ToggleField
              form={form}
              name="autoplay"
              label="Auto-advance slides"
            />
          )}
          <ToggleField
            form={form}
            name="is_active"
            label="Visible on the storefront"
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
              ? "Add section"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};

function ToggleField({
  form,
  name,
  label,
  hint,
}: {
  form: ReturnType<typeof useForm<SectionFormValues>>;
  name: "full_width" | "autoplay" | "is_active";
  label: string;
  hint?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-0.5">
            <FormLabel>{label}</FormLabel>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default SectionForm;
