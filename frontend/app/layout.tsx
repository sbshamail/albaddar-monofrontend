import CartProvider from "@/common/cart/CartProvider";
import { getCategoryTree } from "@/common/data/categories";
import SiteChrome from "@/common/layout/SiteChrome";
import AuthProvider from "@/providers/auth/authContext";
import { getCurrentUser } from "@/providers/auth/session";
import { TooltipProvider } from "@deep-ecommerce/shared/components/ui/tooltip";
import { cn } from "@deep-ecommerce/shared/lib/utils";
import LoaderProvider from "@deep-ecommerce/shared/providers/LoaderContext";
import {
  parseThemeCookie,
  THEME_COOKIE,
} from "@deep-ecommerce/shared/providers/theme/config";
import ThemeProvider from "@deep-ecommerce/shared/providers/theme/themeContext";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
// metadataBase resolves every relative image/URL in the metadata below
// (including the file-convention opengraph-image.jpg/twitter-image.jpg) to
// an absolute URL — link-preview crawlers (WhatsApp, Facebook, Twitter/X)
// need an absolute URL, they won't resolve a relative one themselves.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Albaddar — Buy once, love it, buy again.",
    template: "%s | Albaddar",
  },
  description: "Shop across every category in one place.",
  // No `images` here on purpose — the opengraph-image.jpg/twitter-image.jpg
  // files in this same app/ directory are Next's file-based convention for
  // that; they apply automatically to every route that doesn't override
  // them (e.g. product detail pages supply their own product photo via
  // generateMetadata instead). A static pre-rendered file costs nothing at
  // request time, unlike generating an image on every share.
  openGraph: {
    siteName: "Albaddar",
    title: "Albaddar — Buy once, love it, buy again.",
    description: "Shop across every category in one place.",
    type: "website",
    locale: "en_PK",
    images: ["../../shared/public/images/logo.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Albaddar — Buy once, love it, buy again.",
    description: "Shop across every category in one place.",
    images: ["../../shared/public/images/logo.jpeg"],
  },
};

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const store = await cookies();
  const theme = parseThemeCookie(store.get(THEME_COOKIE)?.value);
  // The category tree backs both the desktop mega menu and the mobile
  // category sheet on every page — a failed fetch here must not blank the
  // whole site, so it falls back to an empty tree (both consumers already
  // render a graceful empty state for that).
  const categories = await getCategoryTree().catch(() => []);
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        geistMono.variable,
        theme.mode,
      )}
      data-color={theme.color !== "neutral" ? theme.color : undefined}
      style={{ "--radius": theme.radius } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <LoaderProvider>
          <ThemeProvider initial={theme}>
            <TooltipProvider>
              <AuthProvider initialUser={user}>
                <CartProvider>
                  <SiteChrome categories={categories}>{children}</SiteChrome>
                  {modal}
                </CartProvider>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
