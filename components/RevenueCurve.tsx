"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueCurveAnalysis, RevenueCurvePoint } from "../lib/types";

function formatCurrency(value: number) {
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function CurveTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RevenueCurvePoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-zinc-950">${point.price.toFixed(2)}</p>
      <p className="mt-1 text-zinc-600">
        {formatCurrency(point.expectedRevenue)} expected daily revenue
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {point.expectedUnits.toFixed(1)} expected units
      </p>
    </div>
  );
}

export function RevenueCurve({ curve }: { curve: RevenueCurveAnalysis | null }) {
  if (!curve) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-500">
        Not enough pricing variation to estimate a revenue curve.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Sample product
          </p>
          <p className="mt-1 font-semibold text-zinc-950">{curve.product.productName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Current price
          </p>
          <p className="mt-1 font-semibold text-zinc-950">
            ${curve.opportunity.currentPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Revenue-max price
          </p>
          <p className="mt-1 font-semibold text-zinc-950">
            ${curve.opportunity.recommendedPrice.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="h-[310px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curve.points} margin={{ top: 12, right: 18, bottom: 8, left: 4 }}>
            <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="price"
              tickFormatter={(value: number) => `$${value.toFixed(0)}`}
              tick={{ fill: "#52525b", fontSize: 12 }}
              axisLine={{ stroke: "#d4d4d8" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: "#52525b", fontSize: 12 }}
              axisLine={{ stroke: "#d4d4d8" }}
              tickLine={false}
            />
            <Tooltip content={<CurveTooltip />} />
            <ReferenceLine
              x={curve.opportunity.currentPrice}
              stroke="#71717a"
              strokeDasharray="4 4"
            />
            <ReferenceLine
              x={curve.opportunity.recommendedPrice}
              stroke="#0f766e"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="expectedRevenue"
              stroke="#dc5f4d"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
