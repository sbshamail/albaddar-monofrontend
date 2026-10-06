import { Layers, Package, ShoppingBag, Sparkles } from "lucide-react";

import CategoryChart from "@/common/dashboard/CategoryChart";
import OrderStatusChart from "@/common/dashboard/OrderStatusChart";
import PendingFulfilledCard from "@/common/dashboard/PendingFulfilledCard";
import StatCard from "@/common/dashboard/StatCard";
import {
  getDashboardCounts,
  getOrderItemsForDashboard,
  getProductsForDashboard,
  getThisWeekProductTotal,
} from "@/common/data/dashboard";
import { getAccessToken } from "@/providers/auth/session";

const PRODUCT_SAMPLE_LIMIT = 500;
const ORDER_ITEM_SAMPLE_LIMIT = 500;

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const page = async () => {
  const token = await getAccessToken();
  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to view the dashboard.
      </p>
    );
  }

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6); // rolling 7-day window, inclusive of today

  let error: string | null = null;
  let counts = { products: 0, orders: 0, categories: 0 };
  let newThisWeek = 0;
  let productsResult: Awaited<ReturnType<typeof getProductsForDashboard>> = {
    data: [],
    total: 0,
  };
  let orderItemsResult: Awaited<ReturnType<typeof getOrderItemsForDashboard>> =
    {
      data: [],
      total: 0,
    };

  try {
    [counts, newThisWeek, productsResult, orderItemsResult] = await Promise.all(
      [
        getDashboardCounts(token),
        getThisWeekProductTotal(token, toISODate(weekAgo), toISODate(today)),
        getProductsForDashboard(token, PRODUCT_SAMPLE_LIMIT),
        getOrderItemsForDashboard(token, ORDER_ITEM_SAMPLE_LIMIT),
      ],
    );
  } catch {
    error = "Couldn't load some dashboard data — showing what's available.";
  }

  // Category breakdown — grouped client-side (well, server-side here, but
  // from already-fetched rows) since there's no aggregate endpoint for it.
  const categoryCounts = new Map<string, number>();
  for (const product of productsResult.data) {
    const name = product.category?.name ?? "Uncategorized";
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
  }
  const categoryData = Array.from(categoryCounts, ([category, count]) => ({
    category,
    count,
  }));

  // Status breakdown + distinct order count — same "no aggregate endpoint"
  // situation, computed from the sampled order items.
  const statusCounts: Record<string, number> = {};
  const orderIds = new Set<number>();
  for (const item of orderItemsResult.data) {
    statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1;
    orderIds.add(item.order_id);
  }

  const productsCapped = productsResult.total > PRODUCT_SAMPLE_LIMIT;
  const orderItemsCapped = orderItemsResult.total > ORDER_ITEM_SAMPLE_LIMIT;
  //
  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 md:p-6">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={counts.products}
          Icon={Package}
          accent="primary"
        />
        <StatCard
          label="New This Week"
          value={newThisWeek}
          sublabel="Last 7 days"
          Icon={Sparkles}
          accent="emerald"
        />
        <StatCard
          label="Pending Order Items"
          value={counts.orders}
          Icon={ShoppingBag}
          accent="amber"
        />
        <StatCard
          label="Distinct Orders"
          value={orderIds.size}
          sublabel={
            orderItemsCapped
              ? `From ${ORDER_ITEM_SAMPLE_LIMIT} most recent items`
              : `${orderItemsResult.total} order items total`
          }
          Icon={Layers}
          accent="sky"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OrderStatusChart statusCounts={statusCounts} />
        <PendingFulfilledCard statusCounts={statusCounts} />
      </div>

      <CategoryChart
        data={categoryData}
        cappedAt={productsCapped ? PRODUCT_SAMPLE_LIMIT : undefined}
      />
    </div>
  );
};

export default page;
