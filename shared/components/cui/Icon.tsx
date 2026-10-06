import * as Icons from "lucide-react";
import React from "react";
type IconName = keyof typeof Icons;
export const LucideIcon = ({
  name,
  ...props
}: { name: string } & React.ComponentProps<"svg">) => {
  // Some exports from lucide-react are helpers (not valid JSX components).
  // Coerce to a React component type to satisfy JSX usage at runtime.
  const raw = Icons[name as IconName] ?? Icons.CircleHelp;
  const Icon = raw as unknown as React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
  return <Icon {...props} />;
};
