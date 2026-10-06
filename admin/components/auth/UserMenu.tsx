"use client";
import { LogOut } from "lucide-react";

import { useAuth } from "@/providers/auth/authContext";
import { Button } from "@deep-ecommerce/shared/components/ui/button";

const UserMenu = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {user && (
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
          {user.full_name ?? user.email ?? user.phone}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void logout()}
        aria-label="Log out"
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
};

export default UserMenu;
