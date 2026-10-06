"use client";

import {
  BadgePercent,
  Boxes,
  ChartNoAxesCombined,
  Home,
  Layers3,
  LayoutTemplate,
  LucideIcon,
  Package,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { DashboardCounts } from "@/types/dashboard_types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@deep-ecommerce/shared/components/ui/sidebar";
import { cn } from "@deep-ecommerce/shared/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

// counts is null while signed out or if the counts fetch failed — items
// just render without a badge in that case (undefined, not 0, so a
// genuinely empty resource still shows "0" once counts do load).
const buildMainItems = (counts: DashboardCounts | null): NavItem[] => [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    badge: counts?.products,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ReceiptText,
    badge: counts?.orders,
  },
  {
    title: "Categories",
    href: "/categories",
    icon: Layers3,
    badge: counts?.categories,
  },
  {
    title: "Homepage",
    href: "/banners",
    icon: LayoutTemplate,
  },
  {
    title: "Shops",
    href: "/shops",
    icon: Store,
  },
];

const managementItems: NavItem[] = [
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
  },
  {
    title: "Coupons",
    href: "/coupons",
    icon: BadgePercent,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const AppSidebarMenu = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(pathname, item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
              <Link href={item.href}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            {item.badge !== undefined ? (
              <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

const AppSidebar = ({ counts }: { counts?: DashboardCounts | null }) => {
  const mainItems = buildMainItems(counts ?? null);
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link href="/">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <ShoppingBag className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Admin</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    Admin
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <AppSidebarMenu items={mainItems} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <AppSidebarMenu items={managementItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div
          className={cn(
            "px-2 pb-1 text-xs text-sidebar-foreground/60",
            "group-data-[collapsible=icon]:hidden",
          )}
        >
          v0.1 Admin
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
