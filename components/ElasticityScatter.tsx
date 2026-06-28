"use client";

import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { ProductSummary } from "../lib/types";

const segmentColors = {
  Elastic: "#dc5f4d",
  Inelastic: "#0f766e",
};

type ScatterPoint = ProductSummary & {
  conversionPct: number;
};

function formatCurrency(value: number) {
  return `$${value.toFixed(0)}`;
}

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-zinc-950">{point.productName}</p>
      <p className="mt-1 text-zinc-600">{point.category}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <dt className="text-zinc-500">Avg price</dt>
        <dd className="text-right font-medium text-zinc-900">
          ${point.avgPrice.toFixed(2)}
        </dd>
        <dt className="text-zinc-500">Conversion</dt>
        <dd className="text-right font-medium text-zinc-900">
          {point.conversionPct.toFixed(2)}%
        </dd>
        <dt className="text-zinc-500">Elasticity</dt>
        <dd className="text-right font-medium text-zinc-900">
          {point.elasticity.toFixed(2)}
        </dd>
      </dl>
    </div>
  );
}

export function ElasticityScatter({ products }: { products: ProductSummary[] }) {
  const data = products.map((product) => ({
    ...product,
    conversionPct: product.avgConversion * 100,
  }));

  return (
    <div className="w-full">
      <div className="mb-4 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
        <div className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2">
          <span className="inline-flex items-center gap-2 font-semibold text-rose-800">
            <span className="h-2.5 w-2.5 rounded-full bg-[#dc5f4d]" />
            Elastic products
          </span>
          <p className="mt-1 leading-5">
            Elasticity {"<="} -1.0. Conversion drops strongly when price rises.
          </p>
        </div>
        <div className="rounded-md border border-teal-100 bg-teal-50 px-3 py-2">
          <span className="inline-flex items-center gap-2 font-semibold text-teal-800">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" />
            Inelastic products
          </span>
          <p className="mt-1 leading-5">
            Elasticity {">"} -1.0. Conversion is less sensitive to price changes.
          </p>
        </div>
      </div>
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 16, left: 4 }}>
            <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
            <XAxis
              dataKey="avgPrice"
              name="Average price"
              tickFormatter={formatCurrency}
              tick={{ fill: "#52525b", fontSize: 12 }}
              axisLine={{ stroke: "#d4d4d8" }}
              tickLine={false}
            />
            <YAxis
              dataKey="conversionPct"
              name="Conversion rate"
              tickFormatter={(value: number) => `${value.toFixed(0)}%`}
              tick={{ fill: "#52525b", fontSize: 12 }}
              axisLine={{ stroke: "#d4d4d8" }}
              tickLine={false}
            />
            <ZAxis range={[60, 220]} dataKey="revenue" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTooltip />} />
            <Scatter data={data}>
              {data.map((point) => (
                <Cell key={point.productId} fill={segmentColors[point.segment]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
