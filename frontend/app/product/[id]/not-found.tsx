import Link from "next/link";

import { Button } from "@deep-ecommerce/shared/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
      <p className="text-sm text-muted-foreground">
        This product may have been removed or is no longer available.
      </p>
      <Button asChild>
        <Link href="/product">Back to shop</Link>
      </Button>
    </div>
  );
}
