"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@deep-ecommerce/shared/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@deep-ecommerce/shared/components/ui/chart";

const chartConfig = {
  count: { label: "Products", color: "var(--color-primary)" },
} satisfies ChartConfig;

export default function CategoryChart({
  data,
  cappedAt,
}: {
  data: { category: string; count: number }[];
  cappedAt?: number;
}) {
  // Longest bars first, capped to the top 8 so the chart stays readable
  // regardless of how many categories a shop has.
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 8);
  const height = Math.max(200, sorted.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products by Category</CardTitle>
        {cappedAt && (
          <p className="text-xs text-muted-foreground">
            Based on the {cappedAt} most recently fetched products
          </p>
        )}
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            No products yet
          </p>
        ) : (
          <ChartContainer config={chartConfig} style={{ height }} className="w-full">
            <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                <LabelList dataKey="count" position="right" className="fill-foreground text-xs" />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
