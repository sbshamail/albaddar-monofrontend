import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deep-ecommerce/shared/components/ui/card";
import { cn } from "@deep-ecommerce/shared/lib/utils";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** "wide" for longer forms (register). */
  size?: "default" | "wide";
}

const AuthCard = ({
  title,
  description,
  children,
  footer,
  size = "default",
}: Props) => (
  <div className="flex min-h-svh items-center justify-center bg-linear-to-br from-primary/10 via-transparent to-chart-2/10 p-4 py-10">
    <div
      className={cn(
        "w-full space-y-5",
        size === "wide" ? "max-w-lg" : "max-w-sm",
      )}
    >
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <div className="border-t px-(--card-spacing) pt-(--card-spacing) text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </Card>
    </div>
  </div>
);

export default AuthCard;
