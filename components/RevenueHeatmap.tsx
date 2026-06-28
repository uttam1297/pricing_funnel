"use client";

import type { RevenueHeatmapData } from "../lib/types";

function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function cellColor(value: number, max: number) {
  if (max === 0 || value === 0) {
    return "#f4f4f5";
  }
  const intensity = value / max;
  if (intensity > 0.72) {
    return "#0f766e";
  }
  if (intensity > 0.46) {
    return "#2aa198";
  }
  if (intensity > 0.22) {
    return "#f0b35a";
  }
  return "#fae5cf";
}

function textColor(value: number, max: number) {
  return max > 0 && value / max > 0.45 ? "#ffffff" : "#3f3f46";
}

export function RevenueHeatmap({ heatmap }: { heatmap: RevenueHeatmapData }) {
  const byKey = new Map(
    heatmap.cells.map((cell) => [`${cell.priceBucket}|${cell.unitBucket}`, cell])
  );
  const templateColumns = `92px repeat(${heatmap.priceBuckets.length}, minmax(74px, 1fr))`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        <div
          className="grid gap-1 text-xs"
          style={{
            gridTemplateColumns: templateColumns,
          }}
        >
          <div />
          {heatmap.priceBuckets.map((priceBucket) => (
            <div
              key={priceBucket}
              className="rounded-md bg-zinc-100 px-2 py-2 text-center font-semibold text-zinc-700"
            >
              {priceBucket}
            </div>
          ))}
          {heatmap.unitBuckets.map((unitBucket) => (
            <div key={unitBucket} className="contents">
              <div className="flex items-center rounded-md bg-zinc-100 px-2 py-3 font-semibold text-zinc-700">
                {unitBucket}
              </div>
              {heatmap.priceBuckets.map((priceBucket) => {
                const cell = byKey.get(`${priceBucket}|${unitBucket}`);
                const revenue = cell?.revenue ?? 0;
                return (
                  <div
                    key={`${priceBucket}-${unitBucket}`}
                    className="flex h-14 items-center justify-center rounded-md px-2 text-center font-semibold"
                    style={{
                      backgroundColor: cellColor(revenue, heatmap.maxRevenue),
                      color: textColor(revenue, heatmap.maxRevenue),
                    }}
                    title={`${priceBucket}, ${unitBucket} units: ${formatCurrency(
                      revenue
                    )} revenue`}
                    aria-label={`${priceBucket}, ${unitBucket} units, ${formatCurrency(
                      revenue
                    )} revenue`}
                  >
                    {revenue > 0 ? formatCurrency(revenue) : "-"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-xs text-zinc-500">
          <span>Units sold per day</span>
          <span>Total revenue in cell</span>
        </div>
      </div>
    </div>
  );
}
