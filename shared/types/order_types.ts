// Mirrors backend src/api/models/order_model/orderItemModel.py's OrderItemsRead.

import { MediaRead } from "./media_types";

export const ORDER_ITEM_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number];

export interface orderShippingAddress {
  city: string;
  phone: string;
  person_name: string;
  region: string;
  postal_code?: string;
  country?: string;
  details: string;
  email?: string;
}

export interface OrderItemRead {
  id: number;
  order_id: number;
  product_id: number | null;
  shop_id: number | null;
  product_variant_id: number | null;
  product_name: string;
  status: OrderItemStatus;
  variant_attributes: Record<string, string> | null;
  price: number;
  actual_price: number | null;
  weight: number | null;
  quantity: number;
  image: MediaRead | null;
  shipping_address: orderShippingAddress;
  created_at: string;
  updated_at: string | null;
}
