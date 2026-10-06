import { ProductVariantBase } from "@deep-ecommerce/shared/types/product_types";

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="text-sm">{value}</dd>
  </div>
);

const VariantViewDetails = ({ variant }: { variant: ProductVariantBase }) => (
  <div className="space-y-4">
    {variant.image?.original && (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={variant.image.original}
        alt={variant.sku ?? `Variant #${variant.id}`}
        className="h-24 w-24 rounded-md border border-border object-cover"
      />
    )}

    <dl className="grid grid-cols-2 gap-3">
      <Field label="SKU" value={variant.sku ?? "—"} />
      <Field label="In stock" value={variant.is_in_stock ? "Yes" : "No"} />
      <Field label="Price" value={variant.price} />
      <Field label="Discount price" value={variant.discount_price ?? "—"} />
      <Field label="Stock" value={variant.stock} />
      <Field label="Position" value={variant.position} />
    </dl>

    {variant.attributes && Object.keys(variant.attributes).length > 0 && (
      <div>
        <h4 className="mb-1 text-xs text-muted-foreground">Attributes</h4>
        <div className="space-y-1">
          {Object.entries(variant.attributes).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-sm"
            >
              <span className="text-muted-foreground">{key}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default VariantViewDetails;
