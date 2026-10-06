"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@deep-ecommerce/shared/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@deep-ecommerce/shared/components/ui/chart";

// Fulfillment status lives per OrderItem, not on the parent Order (see
// admin/common/data/dashboard.ts) — this is a line-item breakdown, not an
// order-count breakdown.
const STATUS_CONFIG = {
  pending: { label: "Pending", color: "var(--color-amber-500)" },
  processing: { label: "Processing", color: "var(--color-sky-500)" },
  shipped: { label: "Shipped", color: "var(--color-violet-500)" },
  delivered: { label: "Delivered", color: "var(--color-emerald-500)" },
  cancelled: { label: "Cancelled", color: "var(--color-rose-500)" },
} satisfies ChartConfig;

const STATUS_ORDER = Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[];

export default function OrderStatusChart({
  statusCounts,
}: {
  statusCounts: Record<string, number>;
}) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    count: statusCounts[status] ?? 0,
    fill: STATUS_CONFIG[status].color,
  })).filter((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Items by Status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            No order items yet
          </p>
        ) : (
          <ChartContainer config={STATUS_CONFIG} className="mx-auto aspect-square max-h-64">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
              <Pie data={data} dataKey="count" nameKey="label" innerRadius={50} strokeWidth={2}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="label" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
