import { MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";

import {
  CONTACTS,
  DARAZ_STORE_URL,
  STORE_LOCATION_URL,
  YOUTUBE_CHANNEL_URL,
  buildWhatsAppLink,
} from "@/common/data/shopInfo";
import YoutubeIcon from "@/common/icons/YoutubeIcon";
import WhatsAppIcon from "@/common/whatsapp/WhatsAppIcon";

/** Static, server-rendered — the only place in the app that links out to
 * /about and /contactus, so they're reachable at all from the UI. */
export default function Footer() {
  return (
    // pb-16 clears the fixed mobile bottom nav (md:hidden) that sits on top
    // of whatever's last in the page flow — this is now that element.
    <footer className="mt-auto border-t border-border bg-secondary/30 pb-16 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
            AlBaddar
          </span>
          <p className="max-w-xs text-sm text-muted-foreground">
            A family business, Buy once, love it, buy again.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-3 text-sm sm:justify-start sm:gap-x-6 sm:gap-y-2">
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground"
          >
            About us
          </Link>
          <Link
            href="/contactus"
            className="text-muted-foreground hover:text-foreground"
          >
            Contact us
          </Link>
          <Link
            href={STORE_LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <MapPin className="size-3.5" />
            Our store
          </Link>
          <Link
            href={DARAZ_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ShoppingBag className="size-3.5" />
            Daraz.pk
          </Link>
          <Link
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <YoutubeIcon className="size-3.5" />
            YouTube
          </Link>
          <a
            href={buildWhatsAppLink(CONTACTS[0].phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <WhatsAppIcon className="size-3.5" />
            WhatsApp
          </a>
        </nav>
      </div>

      <div className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AlBaddar.buyagain.pk — All rights reserved.
      </div>
    </footer>
  );
}
