"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deep-ecommerce/shared/components/ui/card";
import {
  MAX_PRODUCT_IMAGES,
  ProductFormValues,
} from "../schemas/productSchemas";

interface AIProductVariant {
  sku?: string | null;
  price?: number | null;
  discount_price?: number | null;
  stock?: number | null;
  weight?: number | null;
  // Source-site image URL — the backend downloads it into real storage on
  // submit, same as the product-level thumbnail/images below.
  image?: string | null;
}

// Mirrors n8nPrompt.md's static extraction prompt (../backend/n8nPrompt.md)
// — every field optional, since the model only fills in what it actually
// found on the page. thumbnail/images/variants[].image are all raw
// source-site URLs, not yet-uploaded files.
interface AIProductSuggestion {
  name?: string | null;
  short_description?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  whats_in_box?: string | null;
  video_url?: string | null;
  variants?: AIProductVariant[] | null;
}

// n8n's "Respond to Webhook" node wraps whatever the last node produced as
// `{ output: {...} }` — the actual suggestion is one level deeper than the
// { data } envelope the admin proxy already unwraps (see
// admin/app/api/[...slug]/route.ts's backendEnvelope).
interface AIWebhookResponse {
  output?: AIProductSuggestion | null;
}

/**
 * "Generate with AI" panel — pastes a product page URL (+ optional notes)
 * into the n8n product-import automation, which scrapes the page and
 * extracts structured product data per n8nPrompt.md. Dropped straight into
 * this form's own fields for the admin to review/adjust before saving.
 * Never touches storage itself — image URLs are handed to the backend as-is
 * on submit, which downloads and stores them.
 */
export default function AIGenerateProduct({
  form,
}: {
  form: UseFormReturn<ProductFormValues>;
}) {
  const [prompt, setPrompt] = useState(
    "Act as an expert e-commerce copywriter and technical SEO specialist.",
  );
  const [productUrl, setProductUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySuggestion = (suggestion: AIProductSuggestion) => {
    const opts = { shouldDirty: true };

    if (suggestion.name) form.setValue("name", suggestion.name, opts);
    if (suggestion.short_description) {
      form.setValue("short_description", suggestion.short_description, opts);
    }
    if (suggestion.description) {
      form.setValue("description", suggestion.description, opts);
    }
    if (suggestion.whats_in_box) {
      form.setValue("whats_in_box", suggestion.whats_in_box, opts);
    }
    if (suggestion.meta_title) {
      form.setValue("meta_title", suggestion.meta_title, opts);
    }
    if (suggestion.meta_description) {
      form.setValue("meta_description", suggestion.meta_description, opts);
    }
    if (suggestion.video_url) {
      form.setValue("video_url", suggestion.video_url, opts);
    }
    if (suggestion.tags?.length) {
      form.setValue("tags", suggestion.tags.join(", "), opts);
    }
    if (suggestion.thumbnail) {
      form.setValue(
        "thumbnail",
        { filename: null, url: suggestion.thumbnail, file: null },
        opts,
      );
    }
    if (suggestion.images?.length) {
      form.setValue(
        "images",
        suggestion.images
          .slice(0, MAX_PRODUCT_IMAGES)
          .map((url) => ({ filename: null, url, file: null })),
        opts,
      );
    }
    if (suggestion.variants?.length) {
      form.setValue(
        "variants",
        suggestion.variants.map((v) => ({
          price: v.price != null ? String(v.price) : "1",
          discount_price:
            v.discount_price != null ? String(v.discount_price) : "",
          stock: v.stock != null ? String(v.stock) : "1",
          weight: v.weight != null ? String(v.weight) : "",
          sku: v.sku ?? "",
          attributes: [],
          imageFile: null,
          imageUrl: v.image ?? null,
        })),
        opts,
      );
    }
  };

  const generate = async () => {
    const trimmedPrompt = prompt.trim();
    const trimmedUrl = productUrl.trim();
    if (!trimmedUrl) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/webhook/product-ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: trimmedUrl, prompt: trimmedPrompt }),
    });
    const payload = (await res.json().catch(() => null)) as {
      data?: AIWebhookResponse | AIProductSuggestion;
      detail?: string;
    } | null;
    setLoading(false);

    // n8n's webhook wraps the suggestion as { output: {...} } — but respond
    // defensively in case the workflow is ever changed to return it bare.
    const suggestion =
      payload?.data && "output" in payload.data
        ? payload.data.output
        : (payload?.data as AIProductSuggestion | undefined);

    if (!res.ok || !suggestion) {
      setError(
        payload?.detail ?? "Couldn't generate product details. Try again.",
      );
      return;
    }

    applySuggestion(suggestion);
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-primary" />
          Generate with AI
        </CardTitle>
        <CardDescription>
          Paste a product page URL — the automation scrapes it and fills in the
          fields below (including images) for you to review and adjust before
          saving.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <input
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="Product page URL — e.g. https://example.com/products/…"
          className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="Optional notes for the automation, e.g. don't send images or tags, mention everything else"
          className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex items-center justify-end">
          <Button
            type="button"
            size="sm"
            onClick={generate}
            disabled={loading || !productUrl.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
