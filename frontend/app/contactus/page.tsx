import { siteConfig } from "@site-config";
import { MapPin, PhoneOff, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
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
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deep-ecommerce/shared/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Us — AlBadar",
  description: `Reach ${siteConfig.name} on WhatsApp — questions, feedback, or help with an order.`,
};

export default function ContactUsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col items-center gap-3 text-center">
        <h1 className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          Contact Us
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Questions, feedback, or a problem with an order — we&apos;re happy to
          help.
        </p>
        <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-medium text-destructive">
          <PhoneOff className="size-3.5" />
          WhatsApp only, please — we don&apos;t take calls.
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:*:only:col-span-2">
        {CONTACTS.map((contact) => (
          <Card key={contact.name}>
            <CardHeader>
              <CardTitle>{contact.name}</CardTitle>
              <CardDescription>{contact.phone}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="w-full gap-2 bg-[#25D366] hover:bg-[#25D366]/90"
              >
                <a
                  href={buildWhatsAppLink(contact.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-4" />
                  Chat on WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-center text-lg font-semibold text-foreground">
          Or find us here
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={STORE_LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
          >
            <MapPin className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Physical store
            </span>
          </Link>
          <Link
            href={DARAZ_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
          >
            <ShoppingBag className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Daraz.pk store
            </span>
          </Link>
          <Link
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
          >
            <YoutubeIcon className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">YouTube</span>
          </Link>
        </div>
      </section>

      <section className="rounded-lg bg-secondary/50 p-5 text-center text-sm text-muted-foreground">
        Some categories can&apos;t be returned, but for everything else you have
        3 days if there&apos;s a problem — just keep the item as received. Read
        more on our{" "}
        <Link
          href="/about"
          className="font-medium text-primary hover:underline"
        >
          About page
        </Link>
        .
      </section>
    </div>
  );
}
