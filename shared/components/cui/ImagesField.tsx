"use client";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, X } from "lucide-react";
import { useMemo } from "react";
import {
  FieldValues,
  Path,
  useFieldArray,
  UseFormReturn,
} from "react-hook-form";

import SortableList, { DragHandleProps } from "./SortableList";
import { FormLabel } from "../ui/form";

/** One image slot — either an existing server-side image (filename/url set,
 * file null) or a newly-picked file not uploaded yet (file set, filename
 * null). Point any react-hook-form array field of this shape at `name` and
 * this handles the add/remove/reorder/preview UI for it. */
export interface ImageFieldValue {
  filename: string | null;
  url: string | null;
  file: File | null;
}

interface ImagesFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  /** Field path to an array of ImageFieldValue items, e.g. "images" or
   * "gallery.photos". */
  name: Path<TFieldValues>;
  maxImages?: number;
  label?: string;
  className?: string;
}

/**
 * Reusable "up to N images" field: boxes with a preview, a hover delete-X,
 * and a drag handle to reorder — put it on any form, any array field, as
 * long as that field's items look like ImageFieldValue.
 */
const ImagesField = <TFieldValues extends FieldValues>({
  form,
  name,
  maxImages = 4,
  label = "Images",
  className,
}: ImagesFieldProps<TFieldValues>) => {
  const { control } = form;
  // react-hook-form's array-path typing can't be proven generically for an
  // arbitrary caller-supplied `name` — narrowed externally via `Path`, cast
  // internally where RHF wants an exact ArrayPath/FieldArray match.
  const { fields, append, remove, move } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: control as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  });

  const roomLeft = maxImages - fields.length;

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, roomLeft);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files.forEach((file) => append({ filename: null, url: null, file } as any));
    e.target.value = "";
  };

  return (
    <div className={className ?? "space-y-2"}>
      <div className="flex items-center justify-between">
        <FormLabel>
          {label} ({fields.length}/{maxImages})
        </FormLabel>
        {roomLeft > 0 && (
          <label className="cursor-pointer text-sm text-primary hover:underline">
            + Add image
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddFiles}
              className="hidden"
            />
          </label>
        )}
      </div>

      <SortableList
        items={fields}
        onReorder={move}
        strategy={rectSortingStrategy}
        className="flex flex-wrap gap-3"
        renderItem={(field, index, dragHandleProps) => (
          <ImageBox
            key={field.id}
            form={form}
            name={name}
            index={index}
            dragHandleProps={dragHandleProps}
            onRemove={() => remove(index)}
          />
        )}
      />
    </div>
  );
};

interface ImageBoxProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  index: number;
  dragHandleProps: DragHandleProps;
  onRemove: () => void;
}

const ImageBox = <TFieldValues extends FieldValues>({
  form,
  name,
  index,
  dragHandleProps,
  onRemove,
}: ImageBoxProps<TFieldValues>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const file = form.watch(`${name}.${index}.file` as any) as File | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = form.watch(`${name}.${index}.url` as any) as string | null;

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : url),
    [file, url],
  );

  return (
    <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      )}

      <button
        type="button"
        title="Remove image"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <X size={14} />
      </button>

      <button
        type="button"
        title="Drag to reorder"
        className="absolute bottom-1 left-1 cursor-grab touch-none rounded-full bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
        {...dragHandleProps.attributes}
        {...dragHandleProps.listeners}
      >
        <GripVertical size={14} />
      </button>
    </div>
  );
};

export default ImagesField;
