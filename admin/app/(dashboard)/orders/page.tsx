import OrderItemTable from "@/common/table/orderItemTable/OrderItemTable";
import { ApiError, authorizedFetchList } from "@deep-ecommerce/shared/api/server";
import { getAccessToken } from "@/providers/auth/session";
import { OrderItemRead } from "@deep-ecommerce/shared/types/order_types";

const page = async () => {
  const token = await getAccessToken();
  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage orders.
      </p>
    );
  }

  let orderItems: OrderItemRead[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const result = await authorizedFetchList<OrderItemRead>(
      "/order-item/list?limit=200",
      token,
      { cache: "no-store" },
    );
    orderItems = result.data;
    total = result.total;
  } catch (err) {
    loadError =
      err instanceof ApiError ? err.message : "Failed to load order items";
  }

  return (
    <OrderItemTable
      orderItems={orderItems}
      total={total}
      loadError={loadError}
    />
  );
};

export default page;
