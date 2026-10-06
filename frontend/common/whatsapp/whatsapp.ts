import { formatPrice } from "@/common/product/priceHelpers";

// Placeholder until the shop module ships — every product/contact link
// currently orders through this ONE site-wide number. Once shops carry
// their own WhatsApp number, swap this constant's call site for that
// shop's field (no other change needed, every caller already goes through
// this one function/constant).
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+923355144441";

export interface WhatsAppOrderDetails {
  productName: string;
  price: number;
  quantity: number;
  variantAttributes?: Record<string, string> | null;
  /** Absolute URL — wa.me messages go outside this site, a relative path
   * is meaningless to whoever receives the message. WhatsApp unfurls this
   * into a rich preview (title/description/image) via the page's Open
   * Graph tags, which is the only way a "picture" reaches a wa.me link —
   * it can't attach a binary image directly. */
  productUrl: string;
}

/**
 * Builds a wa.me deep link pre-filled with everything the shop needs to
 * confirm and fulfill an order by chat — no address/checkout form at all,
 * that's handled human-to-human once the chat starts. Keep this the single
 * place that formats the message so every "Order on WhatsApp" button says
 * the same thing.
 */
export function buildWhatsAppOrderLink({
  productName,
  price,
  quantity,
  variantAttributes,
  productUrl,
}: WhatsAppOrderDetails): string {
  const lines = [
    "Hi! I'd like to order:",
    "",
    `*${productName}*`,
    `Price: ${formatPrice(price)}`,
    `Quantity: ${quantity}`,
  ];

  const attrs = Object.entries(variantAttributes ?? {});
  if (attrs.length > 0) {
    lines.push(attrs.map(([key, value]) => `${key}: ${value}`).join(", "));
  }

  lines.push("", productUrl);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
