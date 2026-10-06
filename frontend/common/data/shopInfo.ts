// Static business info (not fetched from the backend — there's no CMS/shop
// model for any of this yet) shared by the About and Contact pages, so the
// two never drift apart on a phone number or link.

/** "03355144441" -> "https://wa.me/923355144441" (wa.me needs the country
 * code, no leading 0 and no punctuation). */
export function buildWhatsAppLink(localPhone: string, message?: string) {
  const digits = localPhone.replace(/\D/g, "").replace(/^0/, "");
  const base = `https://wa.me/92${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export interface Contact {
  name: string;
  phone: string;
}

// Calls aren't answered — every contact here is WhatsApp-only, by design
// (see the About/Contact pages).
export const CONTACTS: Contact[] = [
  { name: "Muhammad Baddar", phone: "03359602482" },
];

export const STORE_LOCATION_URL = "https://share.google/dpslDD9trMSArJfR8";
export const DARAZ_STORE_URL = "https://www.daraz.pk/shop/hamza-tools";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/c/mhmarketpk";
