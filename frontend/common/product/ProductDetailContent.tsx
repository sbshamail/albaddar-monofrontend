import { RICH_TEXT_CLASSNAME } from "@deep-ecommerce/shared/components/cui/richTextClassName";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findCategoryPath, getCategoryTree } from "@/common/data/categories";
import { getProduct, getRelatedProducts } from "@/common/data/products";
import ProductGallery from "./ProductGallery";
import ProductGrid from "./ProductGrid";
import VariantSelector from "./VariantSelector";

/**
 * The actual product-detail markup, shared by the full page
 * (app/product/[id]/page.tsx) and the quick-view parallel-route modal
 * (app/@modal/(.)product/[id]/page.tsx) — same data, same fetch, two
 * different chrome wrappers around it. The modal renders it `compact` to
 * stay focused (no breadcrumb, no related-products section pulling in a
 * second fetch inside a dialog).
 */
export default async function ProductDetailContent({
  id,
  compact = false,
}: {
  id: number;
  compact?: boolean;
}) {
  const product = await getProduct(id);
  if (!product) notFound();

  const [categories, related] = compact
    ? [[], []]
    : await Promise.all([
        getCategoryTree().catch(() => []),
        getRelatedProducts(product.category.id, product.id).catch(() => []),
      ]);

  const breadcrumb = compact
    ? []
    : (findCategoryPath(categories, product.category.id) ?? []);

  const images = [
    ...(product.thumbnail ? [product.thumbnail.original] : []),
    ...(product.images?.map((img) => img.original) ?? []),
  ];

  return (
    <div
      className={
        compact
          ? "flex flex-col gap-6"
          : "mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6"
      }
    >
      {!compact && (
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/product" className="hover:text-primary">
            Shop
          </Link>
          {breadcrumb.map((cat) => (
            <span key={cat.id} className="flex items-center gap-1.5">
              <span>/</span>
              <Link
                href={`/product?category=${cat.id}`}
                className="hover:text-primary"
              >
                {cat.name}
              </Link>
            </span>
          ))}
        </nav>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProductGallery
          images={images}
          alt={product.name}
          video_url={product?.video_url}
        />

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
          {product.short_description && (
            <div
              className={`${RICH_TEXT_CLASSNAME} border-t border-border pt-4 text-sm text-muted-foreground"`}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.short_description),
              }}
            />
          )}

          <VariantSelector
            productId={product.id}
            shopId={product.shop.id}
            shopName={product.shop.name}
            productName={product.name}
            fallbackImage={product.thumbnail ?? null}
            variants={product.variants ?? []}
          />

          {product.attributes && product.attributes.length > 0 && (
            <div className="border-t border-border pt-4">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Details
              </h2>
              <dl className="grid grid-cols-2 gap-y-1 text-sm">
                {product.attributes.map((attr) => (
                  <div key={attr.name} className="contents">
                    <dt className="text-muted-foreground capitalize">
                      {attr.name}
                    </dt>
                    <dd className="text-foreground">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {compact && (
            <Link
              href={`/product/${id}`}
              className="text-sm text-primary hover:underline"
            >
              View full details
            </Link>
          )}
        </div>
      </div>

      {/* Full-width below the gallery/info grid — unlike short_description
          (a one-liner shown next to the price/variants above), description
          and what's-in-the-box are long-form rich text and read better at
          full page width than squeezed into the right column. */}
      {(product.description || product.whats_in_box) && (
        <div className="flex flex-col gap-8 border-t border-border pt-8">
          {product.description && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Description
              </h2>
              {/* description is rich text (HTML) from the admin's editor,
                  not plain text — sanitized here since it's shop-admin-
                  supplied content rendered on the public storefront. */}
              <div
                className={`${RICH_TEXT_CLASSNAME} text-sm text-muted-foreground`}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description),
                }}
              />
            </div>
          )}

          {product.whats_in_box && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                What&apos;s in the box
              </h2>
              <div
                className={`${RICH_TEXT_CLASSNAME} text-sm text-muted-foreground`}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.whats_in_box),
                }}
              />
            </div>
          )}
        </div>
      )}

      {!compact && related.length > 0 && (
        <section className="border-t border-border pt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Related Products
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
