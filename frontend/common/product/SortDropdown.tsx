"use client";

import { useSearchParams } from "next/navigation";

import {
  NativeSelect,
  NativeSelectOption,
} from "@deep-ecommerce/shared/components/ui/native-select";
import { useFilterNavigation } from "./useFilterNavigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Low to High" },
  { value: "price-desc", label: "High to Low" },
];

export default function SortDropdown() {
  const { navigate, isPending } = useFilterNavigation();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "newest";

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "newest") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    navigate(`/product?${params.toString()}`);
  };

  return (
    <NativeSelect
      value={current}
      onChange={(e) => onChange(e.target.value)}
      disabled={isPending}
      aria-label="Sort products"
    >
      {SORT_OPTIONS.map((opt) => (
        <NativeSelectOption key={opt.value} value={opt.value}>
          {opt.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
