"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/providers/auth/authContext";
import { AuthShop, AuthUser } from "@/types/auth_types";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deep-ecommerce/shared/components/ui/card";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@deep-ecommerce/shared/components/ui/native-select";
import { LogOut } from "lucide-react";

/**
 * Gate shown by (dashboard)/layout.tsx instead of the sidebar/dashboard chrome
 * whenever the signed-in user has no default_shop — every shop-scoped
 * endpoint (dashboard counts, products, orders, ...) 403s with "No active
 * shop selected" until one is picked, so there's nothing usable to render
 * behind it.
 */
export default function SelectShopScreen({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { logout } = useAuth();
  // Owned shop + membership shops are two separate relations on the backend
  // (Shop.owner_id vs ShopUser) — either can become the default, so offer both.
  const candidateShops = useMemo(() => {
    const shops: AuthShop[] = [];
    const seen = new Set<number>();
    for (const shop of [user.shop, ...(user.shops_member ?? [])]) {
      if (shop && !seen.has(shop.id)) {
        seen.add(shop.id);
        shops.push(shop);
      }
    }
    return shops;
  }, [user.shop, user.shops_member]);

  const [selectedShopId, setSelectedShopId] = useState<string>(
    candidateShops[0] ? String(candidateShops[0].id) : "",
  );
  const [newShopName, setNewShopName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectExistingShop = async () => {
    if (!selectedShopId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shop/set-default-shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: Number(selectedShopId) }),
      });
      const payload = (await res.json().catch(() => null)) as {
        detail?: string;
      } | null;
      if (!res.ok) {
        setError(payload?.detail ?? "Failed to select shop");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const createShop = async () => {
    if (!newShopName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("name", newShopName.trim());
      const res = await fetch("/api/shop/create", {
        method: "POST",
        body: formData,
      });
      const payload = (await res.json().catch(() => null)) as {
        detail?: string;
      } | null;
      if (!res.ok) {
        setError(payload?.detail ?? "Failed to create shop");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-4">
        {candidateShops.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Select a shop</CardTitle>
              <CardDescription>
                Choose which shop you want to manage.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <NativeSelect
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full"
              >
                {candidateShops.map((shop) => (
                  <NativeSelectOption key={shop.id} value={String(shop.id)}>
                    {shop.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button
                onClick={selectExistingShop}
                disabled={submitting || !selectedShopId}
              >
                {submitting ? "Working…" : "Continue"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{"Create your shop"}</CardTitle>
              <CardDescription>
                {"You don't have a shop yet — create one to get started."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                placeholder="Shop name"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
              />
              <Button
                onClick={createShop}
                disabled={submitting || !newShopName.trim()}
                variant={"default"}
              >
                {submitting ? "Working…" : "Create shop"}
              </Button>
            </CardContent>
          </Card>
        )}
        <div
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-destructive duration-300 transition-all"
          onClick={logout}
        >
          <LogOut />
          <p>logout</p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
