"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceBucketSummary } from "../lib/types";

type BucketPoint = PriceBucketSummary & {
  conversionPct: number;
};

function BucketTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: BucketPoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-zinc-950">{point.bucket}</p>
      <p className="mt-1 text-zinc-600">{point.records.toLocaleString()} observations</p>
      <p className="mt-2 text-xs text-zinc-500">Average conversion</p>
      <p className="text-base font-semibold text-zinc-950">
        {point.conversionPct.toFixed(2)}%
      </p>
    </div>
  );
}

export function PriceBucketBarChart({ buckets }: { buckets: PriceBucketSummary[] }) {
  const data = buckets.map((bucket) => ({
    ...bucket,
    conversionPct: bucket.avgConversion * 100,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={{ fill: "#52525b", fontSize: 12 }}
            axisLine={{ stroke: "#d4d4d8" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            tick={{ fill: "#52525b", fontSize: 12 }}
            axisLine={{ stroke: "#d4d4d8" }}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: "#f4f4f5" }} content={<BucketTooltip />} />
          <Bar dataKey="conversionPct" radius={[6, 6, 0, 0]} fill="#0f766e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
