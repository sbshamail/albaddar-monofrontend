"use client";
import { requestAuth } from "@/common/auth/requestAuth";
import { updateProfile } from "@/common/data/user.client";
import { useAuth } from "@/providers/auth/authContext";
import ToggleMode from "@deep-ecommerce/shared/components/cui/themeToggle/ToggleMode";
import { Button } from "@deep-ecommerce/shared/components/ui/button";
import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function ProfileSection() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const updated = await updateProfile({
      full_name: fullName || undefined,
      phone: phone || undefined,
    });
    setSaving(false);
    if (updated) {
      // The backend bumps token_version on any profile change, which
      // invalidates this session's access/refresh tokens immediately —
      // there's no way to silently carry the session forward, so surface
      // that honestly and send the user straight back through sign-in
      // rather than showing a "Saved" state next to a session that's
      // actually already dead underneath.
      setSaved(true);
      requestAuth(router);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={save} className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <Input value={user?.email ?? ""} disabled />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Full name
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Phone
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        {saved && (
          <p className="text-sm text-primary">
            Saved — please sign in again to continue.
          </p>
        )}
        <Button type="submit" disabled={saving} className="self-start">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Theme</h2>
          <p className="text-sm text-muted-foreground">
            Switch between light and dark mode.
          </p>
        </div>
        <ToggleMode />
      </div>

      <div className="border-t border-border pt-6">
        <Button variant="outline" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}
