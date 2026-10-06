"use client";

import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import { useFilterNavigation } from "@/common/product/useFilterNavigation";

export default function SearchBar({ className }: { className?: string }) {
  const { navigate: goTo, isPending } = useFilterNavigation();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("search") ?? "");

  const navigate = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set("search", value.trim());
    else params.delete("search");
    params.delete("page");
    goTo(`/product?${params.toString()}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(term);
  };

  const clear = () => {
    setTerm("");
    navigate("");
  };

  return (
    <form onSubmit={submit} className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="h-9 pr-8"
        />
        {term && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button type="submit" size="icon" aria-label="Search" disabled={isPending}>
        <Search className="size-4" />
      </Button>
    </form>
  );
}
