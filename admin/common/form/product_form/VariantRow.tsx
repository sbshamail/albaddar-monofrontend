import { DragHandleProps } from "@deep-ecommerce/shared/components/cui/SortableList";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { GripVertical, Trash2, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "../schemas/productSchemas";
import { AttributeRow } from "./AttributeRow";

interface VariantRowProps {
  form: UseFormReturn<ProductFormValues>;
  index: number;
  dragHandleProps: DragHandleProps;
  canRemove: boolean;
  onRemove: () => void;
}

const VariantRow = ({
  form,
  index,
  dragHandleProps,
  canRemove,
  onRemove,
}: VariantRowProps) => {
  const { control, watch, setValue } = form;
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({ control, name: `variants.${index}.attributes` });
  const imageFile = watch(`variants.${index}.imageFile`);
  const imageUrl = watch(`variants.${index}.imageUrl`);

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : imageUrl),
    [imageFile, imageUrl],
  );
  useEffect(() => {
    return () => {
      if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile, previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(`variants.${index}.imageFile`, e.target.files?.[0] ?? null, {
      shouldDirty: true,
    });
  };

  const handleRemoveImage = () => {
    setValue(`variants.${index}.imageFile`, null, { shouldDirty: true });
    setValue(`variants.${index}.imageUrl`, null, { shouldDirty: true });
  };

  return (
    <div className="flex gap-2 rounded-md border border-border p-3">
      <button
        type="button"
        className="mt-1 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...dragHandleProps.attributes}
        {...dragHandleProps.listeners}
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          {previewUrl && (
            <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Variant preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                title="Remove image"
                onClick={handleRemoveImage}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block flex-1 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-2.5 file:py-1 file:text-sm"
          />
          {canRemove && (
            <button
              type="button"
              title="Remove variant"
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FormField
            control={control}
            name={`variants.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min={50} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${index}.discount_price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min={1}
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${index}.stock`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`variants.${index}.weight`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Optional"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name={`variants.${index}.sku`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Attributes</FormLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => appendAttribute({ key: "", value: "" })}
            >
              + Add attribute
            </Button>
          </div>

          {attributeFields.map((attrField, attrIndex) => (
            <AttributeRow
              key={attrField.id}
              form={form}
              variantIndex={index}
              attrIndex={attrIndex}
              onRemove={() => removeAttribute(attrIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VariantRow;
