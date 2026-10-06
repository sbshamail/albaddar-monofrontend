import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProduct } from "@/common/data/products";
import { formatPrice } from "@/common/product/priceHelpers";
import ProductDetailContent from "@/common/product/ProductDetailContent";
import { SITE_NAME, SITE_URL } from "@/common/seo/site";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// `description` is rich-text HTML (see the admin's RichTextEditor) — never
// use it raw in a meta tag, link-preview crawlers would show the literal
// markup. short_description exists specifically as a plain-text teaser for
// cases exactly like this one.
function toPlainDescription(product: {
  short_description: string | null;
  description: string | null;
  min_price: number | null;
}): string {
  if (product.short_description) return product.short_description;
  const stripped = product.description
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped)
    return stripped.length > 160 ? `${stripped.slice(0, 157)}...` : stripped;
  return `${formatPrice(product.min_price ?? 0)} — shop now.`;
}

// wa.me links can't attach a binary image — the "picture" in a WhatsApp
// order message only shows up because WhatsApp unfurls the product URL
// itself into a rich link preview (title/description/image), which is
// exactly what these Open Graph tags are for. No metadata here = the
// WhatsApp order message linking to this page shows as bare text.
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) return {};

  const product = await getProduct(productId);
  if (!product) return {};

  const description = toPlainDescription(product);
  const image = product.thumbnail?.original;

  // A page's own `openGraph` object replaces the root's entirely rather
  // than merging field-by-field, so the images key is always set
  // explicitly here — falling back to the site banner (relative path,
  // resolved against the root's metadataBase) for a product with no photo,
  // rather than relying on the root's file-convention image still applying
  // once this segment already returns its own openGraph object.
  const ogImage = image
    ? { url: image, width: 1200, height: 1200, alt: product.name }
    : {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "AlBaddar",
      };

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await getProduct(productId);

  // schema.org Product markup — what makes Google show price/availability
  // and image in rich results. Built from the same plain-text description
  // as the meta tags (never raw rich-text HTML).
  const images = [product?.thumbnail, ...(product?.images ?? [])]
    .filter((m): m is NonNullable<typeof m> => !!m)
    .map((m) => m.original);
  const offerPrices = (product?.variants ?? [])
    .map((v) => v.discount_price ?? v.price)
    .filter((p): p is number => typeof p === "number");
  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: toPlainDescription(product),
    image: images,
    sku: product.variants?.[0]?.sku ?? undefined,
    url: `${SITE_URL}/product/${product.id}`,
    brand: { "@type": "Brand", name: product.shop?.name ?? SITE_NAME },
    offers: offerPrices.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "PKR",
          lowPrice: Math.min(...offerPrices),
          highPrice: Math.max(...offerPrices),
          offerCount: offerPrices.length,
          availability:
            product.total_stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        }
      : undefined,
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // "<" escaped so product text can never close the script tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ProductDetailContent id={productId} />
    </>
  );
}
