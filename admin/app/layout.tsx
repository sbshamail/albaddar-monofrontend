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
import { siteConfig } from "@site-config";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: siteConfig.name,
  // description: "Ecommerce admin dashboard",
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
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        inter.variable,
        theme.mode,
      )}
      data-color={theme.color !== "neutral" ? theme.color : undefined}
      style={{ "--radius": theme.radius } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden">
        <LoaderProvider>
          <ThemeProvider initial={theme}>
            <AuthProvider initialUser={user}>
              <TooltipProvider>
                {children}
                {modal}
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
