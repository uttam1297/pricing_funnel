"use client";

import { useMemo, useState } from "react";
import { BarChart3, DollarSign, MousePointerClick, PackageSearch } from "lucide-react";
import {
  ALL_CATEGORIES,
  filterPricingRecords,
  getPriceBucketSummaries,
  getRevenueCurve,
  getRevenueHeatmap,
  getTopOpportunities,
  summarizeMetrics,
  summarizeProducts,
} from "../lib/analysis";
import type { PricingRecord } from "../lib/types";
import { ChartCard } from "./ChartCard";
import { ElasticityScatter } from "./ElasticityScatter";
import { Filters } from "./Filters";
import { MetricCard } from "./MetricCard";
import { OpportunityTable } from "./OpportunityTable";
import { PriceBucketBarChart } from "./PriceBucketBarChart";
import { RevenueCurve } from "./RevenueCurve";
import { RevenueHeatmap } from "./RevenueHeatmap";

type DashboardProps = {
  records: PricingRecord[];
  categories: string[];
  minDate: string;
  maxDate: string;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000 ? 1 : 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function Dashboard({ records, categories, minDate, maxDate }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);

  const filteredRecords = useMemo(
    () =>
      filterPricingRecords(records, {
        category: selectedCategory,
        startDate,
        endDate,
      }),
    [endDate, records, selectedCategory, startDate]
  );
  const metrics = useMemo(() => summarizeMetrics(filteredRecords), [filteredRecords]);
  const products = useMemo(() => summarizeProducts(filteredRecords), [filteredRecords]);
  const bucketSummaries = useMemo(
    () => getPriceBucketSummaries(filteredRecords),
    [filteredRecords]
  );
  const heatmap = useMemo(() => getRevenueHeatmap(filteredRecords), [filteredRecords]);
  const opportunities = useMemo(
    () => getTopOpportunities(filteredRecords, 8),
    [filteredRecords]
  );
  const curve = useMemo(
    () => getRevenueCurve(filteredRecords, opportunities[0]?.productId),
    [filteredRecords, opportunities]
  );

  function resetFilters() {
    setSelectedCategory(ALL_CATEGORIES);
    setStartDate(minDate);
    setEndDate(maxDate);
  }

  return (
    <>
      <Filters
        categories={categories}
        selectedCategory={selectedCategory}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onCategoryChange={setSelectedCategory}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={resetFilters}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total revenue"
            value={formatCurrency(metrics.totalRevenue)}
            detail={`${formatCompactNumber(metrics.totalUnits)} units sold`}
            icon={DollarSign}
            tone="teal"
          />
          <MetricCard
            label="Conversion rate"
            value={formatPercent(metrics.overallConversion)}
            detail={`${formatCompactNumber(metrics.totalPageViews)} product views`}
            icon={MousePointerClick}
            tone="coral"
          />
          <MetricCard
            label="Catalog products"
            value={metrics.productCount.toLocaleString("en-US")}
            detail={`${products.filter((product) => product.segment === "Elastic").length} elastic products`}
            icon={PackageSearch}
            tone="amber"
          />
          <MetricCard
            label="Overall elasticity"
            value={metrics.overallElasticity.toFixed(2)}
            detail="log-log conversion model coefficient"
            icon={BarChart3}
            tone="zinc"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ChartCard
            eyebrow="Elasticity map"
            title="Price vs. conversion rate"
            description="Each dot is a product. The color labels below define whether the product is elastic or inelastic based on the estimated price elasticity of conversion."
          >
            <ElasticityScatter products={products} />
          </ChartCard>

          <ChartCard
            eyebrow="Price buckets"
            title="Average conversion by price tier"
            description="Conversion is calculated as total units sold divided by total product views within each observed price bucket."
          >
            <PriceBucketBarChart buckets={bucketSummaries} />
          </ChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <ChartCard
            eyebrow="Demand curve"
            title="Revenue-maximizing price point"
            description="The sample product uses a simple linear demand curve estimated from daily price and unit observations."
          >
            <RevenueCurve curve={curve} />
          </ChartCard>

          <ChartCard
            eyebrow="Revenue density"
            title="Revenue heatmap: price vs. units sold"
            description="Cells aggregate revenue across price tiers and daily unit-sales bands."
          >
            <RevenueHeatmap heatmap={heatmap} />
          </ChartCard>
        </div>

        <div className="mt-6">
          <ChartCard
            eyebrow="Action list"
            title="Top revenue optimization opportunities"
            description="Recommendations compare current average price to the revenue-maximizing price from a simple product-level demand curve."
          >
            <OpportunityTable opportunities={opportunities} />
          </ChartCard>
        </div>
      </div>
    </>
  );
}
