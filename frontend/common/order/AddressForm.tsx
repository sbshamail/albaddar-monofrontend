"use client";

import { AddressDetail } from "@/common/data/address.client";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@deep-ecommerce/shared/components/ui/native-select";

// Pakistan's administrative regions — stored as a plain string in
// AddressDetail.region on the backend (a JSON column, not an enum), this is
// just a fixed, must-pick list on the frontend rather than free text.
const REGIONS = [
  "Azad Kashmir",
  "Balochistan",
  "Federally Administered Tribal Areas",
  "Gilgit-Baltistan",
  "Islamabad",
  "Khyber Pakhtunkhwa",
  "Punjab",
  "Sindh",
];

/** Plain controlled field set for one AddressDetail — reused by both the
 * checkout form's "add a new address" step and the account page's address
 * section, so the two never drift apart. */
export default function AddressForm({
  value,
  onChange,
}: {
  value: AddressDetail;
  onChange: (next: AddressDetail) => void;
}) {
  const set =
    (field: keyof AddressDetail) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...value, [field]: e.target.value });

  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="col-span-2 flex flex-col gap-1.5 text-sm sm:col-span-1">
        Full name
        <Input
          required
          value={value.person_name ?? ""}
          onChange={set("person_name")}
        />
      </label>
      <label className="col-span-2 flex flex-col gap-1.5 text-sm sm:col-span-1">
        Phone
        <Input required value={value.phone ?? ""} onChange={set("phone")} />
      </label>
      <label className="col-span-2 flex flex-col gap-1.5 text-sm">
        Address
        <Input
          required
          placeholder="Street address"
          value={value.details}
          onChange={set("details")}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        City
        <Input required value={value.city} onChange={set("city")} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Region
        <NativeSelect
          required
          className="w-full"
          value={value.region ?? ""}
          onChange={set("region")}
        >
          <NativeSelectOption value="" disabled>
            Select region
          </NativeSelectOption>
          {REGIONS.map((region) => (
            <NativeSelectOption key={region} value={region}>
              {region}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Country
        <Input value={"Pakistan"} disabled />
      </label>
    </div>
  );
}
