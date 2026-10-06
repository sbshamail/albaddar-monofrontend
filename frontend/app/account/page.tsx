"use client";

import { MapPin, Package, User as UserIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@deep-ecommerce/shared/components/ui/button";

import { cn } from "@deep-ecommerce/shared/lib/utils";

import { requestAuth } from "@/common/auth/requestAuth";

import { AddressSection } from "@/common/account/AddressSection";
import { OrdersSection } from "@/common/account/OrderSection";
import { ProfileSection } from "@/common/account/ProfileSection";
import { useAuth } from "@/providers/auth/authContext";

// One place to add the next section (Wishlist, Payment methods, whatever
// comes next) — a new entry here plus a matching case in the switch below
// is the whole change needed.
const SECTIONS = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "address", label: "Address", icon: MapPin },
  { key: "orders", label: "Orders", icon: Package },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

function isSectionKey(value: string | null): value is SectionKey {
  return SECTIONS.some((s) => s.key === value);
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your account.
        </p>
        <Button onClick={() => requestAuth(router)}>Sign in</Button>
      </div>
    );
  }

  const activeSection: SectionKey = isSectionKey(searchParams.get("section"))
    ? (searchParams.get("section") as SectionKey)
    : "profile";

  const goToSection = (key: SectionKey) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", key);
    router.push(`/account?${params.toString()}`);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-8">
      <nav className="flex gap-1 overflow-x-auto md:w-48 md:shrink-0 md:flex-col md:overflow-visible">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => goToSection(key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              activeSection === key
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        {activeSection === "profile" && <ProfileSection />}
        {activeSection === "address" && <AddressSection />}
        {activeSection === "orders" && <OrdersSection />}
      </div>
    </div>
  );
}
