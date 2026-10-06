import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@deep-ecommerce/shared/components/ui/card";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthCard = ({ title, description, children, footer }: Props) => (
  <div className="flex min-h-svh items-center justify-center p-4">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <div className="px-(--card-spacing) pb-(--card-spacing) text-sm text-muted-foreground">{footer}</div>}
    </Card>
  </div>
);

export default AuthCard;
