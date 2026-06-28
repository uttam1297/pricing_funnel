"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { PriceOpportunity } from "../lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OpportunityTable({
  opportunities,
}: {
  opportunities: PriceOpportunity[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            <th className="py-3 pr-4">Product</th>
            <th className="py-3 pr-4">Segment</th>
            <th className="py-3 pr-4 text-right">Current</th>
            <th className="py-3 pr-4 text-right">Target</th>
            <th className="py-3 pr-4 text-right">Change</th>
            <th className="py-3 pr-4 text-right">Monthly lift</th>
            <th className="py-3">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => {
            const increase = opportunity.priceChangePct >= 0;
            const Icon = increase ? ArrowUpRight : ArrowDownRight;

            return (
              <tr key={opportunity.productId} className="border-b border-zinc-100">
                <td className="py-4 pr-4 align-top">
                  <p className="font-semibold text-zinc-950">{opportunity.productName}</p>
                  <p className="mt-1 text-xs text-zinc-500">{opportunity.category}</p>
                </td>
                <td className="py-4 pr-4 align-top">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                      opportunity.segment === "Elastic"
                        ? "bg-rose-50 text-rose-800"
                        : "bg-teal-50 text-teal-800"
                    }`}
                  >
                    {opportunity.segment}
                  </span>
                  <p className="mt-1 text-xs text-zinc-500">
                    e={opportunity.elasticity.toFixed(2)}
                  </p>
                </td>
                <td className="py-4 pr-4 text-right align-top font-medium text-zinc-900">
                  ${opportunity.currentPrice.toFixed(2)}
                </td>
                <td className="py-4 pr-4 text-right align-top font-medium text-zinc-900">
                  ${opportunity.recommendedPrice.toFixed(2)}
                </td>
                <td className="py-4 pr-4 text-right align-top">
                  <span
                    className={`inline-flex items-center justify-end gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                      increase
                        ? "bg-teal-50 text-teal-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                    {Math.abs(opportunity.priceChangePct).toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 pr-4 text-right align-top font-semibold text-zinc-950">
                  {formatCurrency(opportunity.monthlyRevenueLift)}
                </td>
                <td className="max-w-md py-4 align-top text-zinc-600">
                  {opportunity.recommendation}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
