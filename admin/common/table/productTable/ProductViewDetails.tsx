import { ProductRead } from "@deep-ecommerce/shared/types/product_types";

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-sm">{value}</dd>
  </div>
);

const ProductViewDetails = ({ product }: { product: ProductRead }) => (
  <div className="space-y-4">
    {(product.thumbnail?.original || (product.images?.length ?? 0) > 0) && (
      <div className="flex gap-2">
        {[product.thumbnail, ...(product.images ?? [])]
          .filter((media): media is NonNullable<typeof media> => Boolean(media))
          .map((media) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={media.filename}
              src={media.original}
              alt={product.name}
              className="h-20 w-20 rounded-md border border-border object-cover"
            />
          ))}
      </div>
    )}

    <dl className="grid grid-cols-2 gap-3">
      <Field label="Category" value={product.category.name} />
      <Field label="Status" value={product.is_active ? "Active" : "Inactive"} />
      <Field label="Featured" value={product.is_featured ? "Yes" : "No"} />
      <Field label="Stock" value={product.total_stock} />
      <Field
        label="Price range"
        value={`${product.min_price ?? "—"} - ${product.max_price ?? "—"}`}
      />
      <Field
        label="Created"
        value={new Date(product.created_at).toLocaleDateString()}
      />
    </dl>

    {product.description && (
      <div>
        <h4 className="mb-1 text-xs text-muted-foreground">Description</h4>
        <p className="text-sm">{product.description}</p>
      </div>
    )}

    {product.tags && product.tags.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {product.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2 py-0.5 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    {product.variants && product.variants.length > 0 && (
      <div>
        <h4 className="mb-1 text-xs text-muted-foreground">
          Variants ({product.variants.length})
        </h4>
        <div className="space-y-1">
          {product.variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-sm"
            >
              <span>{variant.sku ?? `Variant #${variant.id}`}</span>
              <span className="text-muted-foreground">
                {variant.price} · stock {variant.stock}
                {variant.weight != null && ` · ${variant.weight} kg`}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default ProductViewDetails;
