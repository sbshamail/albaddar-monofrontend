import { redirect } from "next/navigation";

// This path only exists to be intercepted (app/@modal/(.)product/[id]/view/)
// for the quick-view modal — a direct hit (hard reload, shared link, no JS)
// has no modal to show, so it just sends you to the real page.
export default async function ProductViewFallback({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/product/${id}`);
}
