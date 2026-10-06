import { notFound } from "next/navigation";

import ProductDetailContent from "@/common/product/ProductDetailContent";
import ProductQuickViewModal from "@/common/product/ProductQuickViewModal";

interface QuickViewProps {
  params: Promise<{ id: string }>;
}

export default async function ProductQuickView({ params }: QuickViewProps) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  return (
    <ProductQuickViewModal productId={productId}>
      <ProductDetailContent id={productId} compact />
    </ProductQuickViewModal>
  );
}
