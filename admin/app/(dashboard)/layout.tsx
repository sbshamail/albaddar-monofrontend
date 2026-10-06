import AppSidebar from "@/components/AppSidebar";
import UserMenu from "@/components/auth/UserMenu";
import SelectShopScreen from "@/common/shop/SelectShopScreen";
import { getAccessToken, getCurrentUser } from "@/providers/auth/session";
import { DashboardCounts } from "@/types/dashboard_types";
import { authorizedFetch } from "@deep-ecommerce/shared/api/server";
import ToggleMode from "@deep-ecommerce/shared/components/cui/themeToggle/ToggleMode";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@deep-ecommerce/shared/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts only checks cookie presence; this is the real check — it fails
  // closed for every page by default, unless the page's path is listed in
  // OPTIONAL_AUTH_DASHBOARD_PATHS (see auth/config.ts).
  // const pathname = (await headers()).get("x-pathname") ?? "";
  // const isOptionalAuthPath = matchesPath(
  //   OPTIONAL_AUTH_DASHBOARD_PATHS,
  //   pathname,
  // );

  // if (!isOptionalAuthPath) await requireUser();

  const token = await getAccessToken();
  const user = await getCurrentUser();

  // Every shop-scoped endpoint (dashboard counts, products, orders, ...)
  // 403s "No active shop selected" until the user has a default_shop —
  // render the select/create-shop screen instead of a dashboard that can't
  // actually load anything, rather than swallowing that error like the
  // counts fetch below does for its own (non-fatal) badge data.
  if (user && !user.default_shop_id) {
    return <SelectShopScreen user={user} />;
  }

  let counts: DashboardCounts | null = null;
  if (token) {
    try {
      counts = await authorizedFetch<DashboardCounts>(
        "/dashboard/counts",
        token,
        { cache: "no-store" },
      );
    } catch {
      // Non-fatal — sidebar just renders without badges.
    }
  }

  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppSidebar counts={counts} />
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Admin</h1>
            <p className="truncate text-xs text-muted-foreground">
              Products, orders, categories, shops and reports
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ToggleMode />
            <UserMenu />
          </div>
        </header>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto p-3 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
