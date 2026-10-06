"use client";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

import { Input } from "@deep-ecommerce/shared/components/ui/input";
import { cn } from "@deep-ecommerce/shared/lib/utils";

const PasswordInput = ({
  className,
  ...props
}: React.ComponentProps<typeof Input>) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export default PasswordInput;
