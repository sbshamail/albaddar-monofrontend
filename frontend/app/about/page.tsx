import {
  Apple,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  CONTACTS,
  DARAZ_STORE_URL,
  STORE_LOCATION_URL,
  YOUTUBE_CHANNEL_URL,
  buildWhatsAppLink,
} from "@/common/data/shopInfo";
import YoutubeIcon from "@/common/icons/YoutubeIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deep-ecommerce/shared/components/ui/card";
import logo from "../../../shared/public/images/logo.jpeg";

export const metadata: Metadata = {
  title: "About Al Baddar Organic",
  description:
    "Discover the three-generation family story behind Al Baddar Organic, from a neighborhood milk shop to a family-run shopping center and nutrition-focused grocery products.",
};

const CATEGORIES = [
  { name: "Wholesome flours", icon: PackageCheck },
  { name: "Protein-rich foods", icon: Zap },
  { name: "Nutrient-rich essentials", icon: Apple },
];

const TIMELINE = [
  {
    year: "Our beginnings in Pakistan",
    title: "A neighborhood milk shop",
    text: "When our family came to Pakistan, our ancestors began serving the community with a small milk shop.",
  },
  {
    year: "The next chapter",
    title: "From milk to groceries",
    text: "As the family business grew, the milk shop expanded into a grocery store, bringing more everyday essentials under one roof.",
  },
  {
    year: "Growing with our community",
    title: "A complete shopping center",
    text: "Over time, the business grew into a complete shopping center, serving customers across a wider range of needs.",
  },
  {
    year: "Three generations on",
    title: "A family business, carried forward",
    text: "Different members of the family continue the work today, with the third generation now helping lead the business forward.",
  },
  {
    year: "Today",
    title: "Introducing Al Baddar Organic online",
    text: "We recently added nutrition-focused products to our grocery store. Now we are bringing our wholesome flours, protein-rich foods, and nutrient-rich essentials to more homes online.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-10">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 text-center">
        <Image
          src={logo}
          alt="AlBaddar logo"
          width={72}
          height={72}
          className="rounded-lg"
        />
        <h1 className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
          Al Baddar Organic
        </h1>
        <p className="max-w-xl text-muted-foreground">
          A family business rooted in Pakistan, grown over three generations,
          and now bringing carefully chosen, nutrition-focused grocery products
          to your home.
        </p>
      </section>

      {/* Our story */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Our story</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            From a neighborhood milk shop to a family-run shopping center, our
            story has always been about serving people well.
          </p>
        </div>

        <ol className="flex flex-col gap-5 border-l-2 border-border pl-6">
          {TIMELINE.map((item) => (
            <li key={item.title} className="relative">
              <span className="absolute top-1 left-[-1.6rem] size-2.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                {item.year}
              </span>
              <h3 className="mt-0.5 font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Al Baddar Organic products */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Al Baddar Organic
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A thoughtfully selected range of nourishing grocery essentials, now
            available online.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Card key={name} className="items-center py-6 text-center">
              <CardContent className="flex flex-col items-center gap-2">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <span className="font-medium text-foreground">{name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Our promise */}
      <section className="rounded-lg bg-secondary/50 p-6 text-center md:p-10">
        <ShieldCheck className="mx-auto mb-3 size-8 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Quality our family stands behind
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          We stand behind the quality of every product we offer. Our family
          carefully oversees the selection of this range, choosing products that
          meet the standards we want for our own homes.
        </p>
      </section>

      {/* Easy ordering + Help + Returns */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <MessageCircle className="mb-1 size-6 text-primary" />
            <CardTitle>Easy ordering</CardTitle>
            <CardDescription>
              Order directly on WhatsApp — every product has an &quot;Order on
              WhatsApp&quot; button. Or create an account for easy order
              tracking; it only takes a minute.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Sparkles className="mb-1 size-6 text-primary" />
            <CardTitle>Need help?</CardTitle>
            <CardDescription>
              Message us on WhatsApp any time — feedback, a problem with an
              order, anything you think we&apos;re missing. InshaAllah,
              we&apos;ll fix it.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <PackageCheck className="mb-1 size-6 text-primary" />
            <CardTitle>Return policy</CardTitle>
            <CardDescription>
              Some categories can&apos;t be returned, but for everything else
              you have 3 days if there&apos;s a problem. Please keep the item as
              received — original condition — to claim a return.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Find us */}
      <section className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Find us</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href={STORE_LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
          >
            <MapPin className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Visit our physical store
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
              Our Daraz.pk store
            </span>
          </Link>
          <Link
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted"
          >
            <YoutubeIcon className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Watch us on YouTube
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-4 rounded-lg bg-primary/5 p-8 text-center">
        <Truck className="size-7 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Ready to shop, or have a question first?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/product"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            Shop now
          </Link>
          <a
            href={buildWhatsAppLink(
              CONTACTS[0].phone,
              "Hi! I have a question about Al Baddar Organic.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <MessageCircle className="size-4" />
            Chat with us
          </a>
        </div>
      </section>
    </div>
  );
}
