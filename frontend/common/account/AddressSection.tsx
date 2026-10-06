"use client";
import { useEffect, useState } from "react";

import {
  AddressDetail,
  createAddress,
  listAddresses,
  setDefaultAddress,
  UserAddress,
} from "@/common/data/address.client";

import AddressForm from "@/common/order/AddressForm";
import { useAuth } from "@/providers/auth/authContext";
import { Button } from "@deep-ecommerce/shared/components/ui/button";

export function AddressSection() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<AddressDetail>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One-time fetch on mount — genuine external-system sync, not derived
  // state.
  useEffect(() => {
    listAddresses().then(setAddresses);
  }, []);

  const startAdding = () => {
    setDraft({
      ...EMPTY_DRAFT,
      person_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
    });
    setError(null);
    setAdding(true);
  };

  const saveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const created = await createAddress(draft, (addresses?.length ?? 0) === 0);
    setSaving(false);
    if (!created) {
      setError("Couldn't save that address. Check the details and try again.");
      return;
    }
    setAddresses((prev) => [...(prev ?? []), created]);
    setAdding(false);
  };

  const makeDefault = async (id: number) => {
    setSettingDefaultId(id);
    setError(null);
    const ok = await setDefaultAddress(id);
    setSettingDefaultId(null);
    if (!ok) {
      setError("Couldn't set that address as default.");
      return;
    }
    setAddresses(
      (prev) =>
        prev?.map((a) => ({ ...a, default: a.id === id ? 1 : 0 })) ?? prev,
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-foreground">Addresses</h2>

      {addresses === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : addresses.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border p-3 text-sm"
            >
              <span>
                {formatAddress(addr.address)}
                {addr.default === 1 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (default)
                  </span>
                )}
              </span>
              {addr.default !== 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={settingDefaultId === addr.id}
                  onClick={() => makeDefault(addr.id)}
                >
                  {settingDefaultId === addr.id ? "Setting…" : "Set as default"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={saveNewAddress} className="flex flex-col gap-3">
          <AddressForm value={draft} onChange={setDraft} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save address"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={startAdding}
          >
            Add address
          </Button>
        </>
      )}
    </div>
  );
}

const EMPTY_DRAFT: AddressDetail = {
  details: "",
  city: "",
  region: "",
  postal_code: "",
  // See the matching comment in OrderForm.tsx — AddressForm's "Country"
  // field is disabled/display-only, so the real value has to be set here.
  country: "Pakistan",
  person_name: "",
  phone: "",
};

function formatAddress(a: AddressDetail): string {
  return [a.person_name, a.details, a.city, a.region, a.postal_code, a.country]
    .filter(Boolean)
    .join(", ");
}
