import { authorizedFetch, authorizedFetchList } from "@deep-ecommerce/shared/api/server";
import { buildListQuery } from "@deep-ecommerce/shared/api/listQuery";
import { ProductRead } from "@deep-ecommerce/shared/types/product_types";

// Mirrors backend GET /dashboard/counts (src/api/routers/dashboard/dashboardRoute.py) —
// same endpoint the sidebar badges already use. `orders` there is actually a
// pending-OrderItem COUNT(*), not a total-orders count (the backend comment
// calls it "actionable count, not a forever-growing total") — kept the same
// field name here to match the backend response, but read it as "pending
// order items" everywhere it's displayed.
export interface DashboardCounts {
  products: number;
  orders: number;
  categories: number;
}

export async function getDashboardCounts(token: string): Promise<DashboardCounts> {
  return authorizedFetch<DashboardCounts>("/dashboard/counts", token, {
    cache: "no-store",
  });
}

// OrderItemsRead (backend) — no created_at on this schema, so no time-series
// chart is possible from this endpoint alone (see AGENTS.md note if that
// changes). Fulfillment status lives per line item, not on the parent Order.
export interface DashboardOrderItem {
  id: number;
  order_id: number;
  status: string;
  product_name: string;
  quantity: number;
  price: number;
}

/**
 * Products for the category/this-week breakdown charts. Capped at `limit`
 * rows for the client-side grouping (category, is_active, created_at are
 * already on every row) — `total` in the response is still the real,
 * unlimited DB count, so stat cards that just need a number stay accurate
 * even if a shop has more than `limit` products; only the per-category
 * breakdown chart would under-count products past the cap.
 */
export async function getProductsForDashboard(
  token: string,
  limit = 500,
): Promise<{ data: ProductRead[]; total: number }> {
  return authorizedFetchList<ProductRead>(`/product/my-products?limit=${limit}`, token, {
    cache: "no-store",
  });
}

export async function getThisWeekProductTotal(
  token: string,
  sinceISO: string,
  untilISO: string,
): Promise<number> {
  const query = buildListQuery({
    limit: 1,
    dateRange: ["created_at", sinceISO, untilISO],
  });
  const { total } = await authorizedFetchList<ProductRead>(
    `/product/my-products?${query}`,
    token,
    { cache: "no-store" },
  );
  return total;
}

/**
 * Order items for the status-breakdown chart and the pending/fulfilled
 * split — capped at `limit` for the same reason as getProductsForDashboard.
 * `total` is the real unlimited count of order items for this shop.
 */
export async function getOrderItemsForDashboard(
  token: string,
  limit = 500,
): Promise<{ data: DashboardOrderItem[]; total: number }> {
  return authorizedFetchList<DashboardOrderItem>(`/order-item/list?limit=${limit}`, token, {
    cache: "no-store",
  });
}
