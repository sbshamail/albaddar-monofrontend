import { FormField } from "@deep-ecommerce/shared/components/ui/form";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@deep-ecommerce/shared/components/ui/native-select";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProductFormValues } from "../schemas/productSchemas";

const ATTRIBUTE_KEY_PRESETS = ["Color", "Size"];
const CUSTOM_KEY = "__custom__";

interface AttributeRowProps {
  form: UseFormReturn<ProductFormValues>;
  variantIndex: number;
  attrIndex: number;
  onRemove: () => void;
}

export const AttributeRow = ({
  form,
  variantIndex,
  attrIndex,
  onRemove,
}: AttributeRowProps) => {
  const { control, getValues, setValue } = form;
  const keyPath =
    `variants.${variantIndex}.attributes.${attrIndex}.key` as const;

  // Custom mode is a user choice, not something derivable from the key
  // value alone (an empty string is both "just switched to custom, not
  // typed yet" and "no key picked yet") — initialize once from whatever
  // value this row already has (e.g. an existing non-preset attribute when
  // editing), then only explicit actions below change it.
  const [isCustom, setIsCustom] = useState(() => {
    const value = getValues(keyPath);
    return Boolean(value) && !ATTRIBUTE_KEY_PRESETS.includes(value);
  });

  // shouldDirty meaning "the user changed something from its original value."
  const selectPreset = (value: string) => {
    if (value === CUSTOM_KEY) {
      setIsCustom(true);
      setValue(keyPath, "", { shouldDirty: true });
      return;
    }
    setValue(keyPath, value, { shouldDirty: true });
  };

  const clearCustom = () => {
    setIsCustom(false);
    setValue(keyPath, "", { shouldDirty: true });
  };

  return (
    <div className="flex items-center gap-2">
      {isCustom ? (
        <FormField
          control={control}
          name={keyPath}
          render={({ field }) => (
            <div className="relative flex-1">
              <Input placeholder="Attribute name" {...field} className="pr-8" />
              <button
                type="button"
                title="Back to preset list"
                onClick={clearCustom}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          )}
        />
      ) : (
        <FormField
          control={control}
          name={keyPath}
          render={({ field }) => (
            <NativeSelect
              className="flex-1"
              value={field.value || ""}
              onChange={(e) => selectPreset(e.target.value)}
            >
              <NativeSelectOption value="" disabled>
                Select attribute
              </NativeSelectOption>
              {ATTRIBUTE_KEY_PRESETS.map((preset) => (
                <NativeSelectOption key={preset} value={preset}>
                  {preset}
                </NativeSelectOption>
              ))}
              <NativeSelectOption value={CUSTOM_KEY}>
                Custom…
              </NativeSelectOption>
            </NativeSelect>
          )}
        />
      )}

      <FormField
        control={control}
        name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
        render={({ field }) => (
          <Input placeholder="Value" {...field} className="flex-1" />
        )}
      />

      <button
        type="button"
        title="Remove attribute"
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
