"use client";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  FieldValues,
  Path,
  useFieldArray,
  UseFormReturn,
} from "react-hook-form";

import { Button } from "../ui/button";
import { FormField, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "../ui/native-select";

const DEFAULT_PRESETS = ["Color", "Size"];
const CUSTOM_KEY = "__custom__";

interface AttributesFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  /** Field path to an array of {key, value} items, e.g. "attributes" or
   * "variants.0.attributes". */
  name: Path<TFieldValues>;
  label?: string;
  /** Attribute-name presets shown in the dropdown before falling back to a
   * free-text "Custom…" entry. */
  presets?: string[];
}

/**
 * Reusable key/value attribute list — key is picked from a preset dropdown
 * (or typed freely via "Custom…"), value is always free text. Put it on any
 * form, any array field, as long as that field's items are {key, value}.
 */
const AttributesField = <TFieldValues extends FieldValues>({
  form,
  name,
  label = "Attributes",
  presets = DEFAULT_PRESETS,
}: AttributesFieldProps<TFieldValues>) => {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: control as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        <Button
          type="button"
          size="sm"
          variant="outline"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => append({ key: "", value: "" } as any)}
        >
          + Add attribute
        </Button>
      </div>

      {fields.map((field, index) => (
        <AttributeRow
          key={field.id}
          form={form}
          name={name}
          index={index}
          presets={presets}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  );
};

interface AttributeRowProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  index: number;
  presets: string[];
  onRemove: () => void;
}

const AttributeRow = <TFieldValues extends FieldValues>({
  form,
  name,
  index,
  presets,
  onRemove,
}: AttributeRowProps<TFieldValues>) => {
  const { control, getValues, setValue } = form;
  const keyPath = `${name}.${index}.key` as Path<TFieldValues>;
  const valuePath = `${name}.${index}.value` as Path<TFieldValues>;

  // Custom mode is a user choice, not derivable from the key value alone
  // (an empty string is both "just switched to custom" and "nothing picked
  // yet") — initialize once from whatever this row already has (e.g. an
  // existing non-preset attribute when editing), then only explicit
  // actions below change it.
  const [isCustom, setIsCustom] = useState(() => {
    const value = getValues(keyPath) as unknown as string;
    return Boolean(value) && !presets.includes(value);
  });

  const selectPreset = (value: string) => {
    if (value === CUSTOM_KEY) {
      setIsCustom(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue(keyPath, "" as any, { shouldDirty: true });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(keyPath, value as any, { shouldDirty: true });
  };

  const clearCustom = () => {
    setIsCustom(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(keyPath, "" as any, { shouldDirty: true });
  };

  return (
    <div className="flex items-center gap-2">
      {isCustom ? (
        <FormField
          control={control}
          name={keyPath}
          render={({ field }) => (
            <div className="relative flex-1">
              <Input
                placeholder="Attribute name"
                {...field}
                className="pr-8"
              />
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
              value={(field.value as string) || ""}
              onChange={(e) => selectPreset(e.target.value)}
            >
              <NativeSelectOption value="" disabled>
                Select attribute
              </NativeSelectOption>
              {presets.map((preset) => (
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
        name={valuePath}
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

export default AttributesField;
