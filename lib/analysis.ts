import type {
  DashboardMetrics,
  ElasticityResult,
  HeatmapCell,
  PriceBucketSummary,
  PriceOpportunity,
  PricingRecord,
  ProductSummary,
  RegressionResult,
  RevenueCurveAnalysis,
  RevenueCurvePoint,
  RevenueHeatmapData,
} from "./types";

type FilterOptions = {
  category?: string;
  startDate?: string;
  endDate?: string;
};

type Bucket = {
  label: string;
  min: number;
  max: number;
};

const ALL_CATEGORIES = "All categories";

const PRICE_BUCKETS: Bucket[] = [
  { label: "$0-10", min: 0, max: 10 },
  { label: "$10-25", min: 10, max: 25 },
  { label: "$25-50", min: 25, max: 50 },
  { label: "$50-100", min: 50, max: 100 },
  { label: "$100-200", min: 100, max: 200 },
  { label: "$200-500", min: 200, max: 500 },
  { label: "$500+", min: 500, max: Number.POSITIVE_INFINITY },
];

const UNIT_BUCKETS: Bucket[] = [
  { label: "0-5", min: 0, max: 6 },
  { label: "6-15", min: 6, max: 16 },
  { label: "16-30", min: 16, max: 31 },
  { label: "31-55", min: 31, max: 56 },
  { label: "56-90", min: 56, max: 91 },
  { label: "90+", min: 91, max: Number.POSITIVE_INFINITY },
];

export { ALL_CATEGORIES };

function groupByProduct(records: PricingRecord[]) {
  const groups = new Map<string, PricingRecord[]>();
  for (const record of records) {
    const existing = groups.get(record.product_id);
    if (existing) {
      existing.push(record);
    } else {
      groups.set(record.product_id, [record]);
    }
  }
  return groups;
}

function sum(records: PricingRecord[], selector: (record: PricingRecord) => number) {
  return records.reduce((total, record) => total + selector(record), 0);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }
  return sorted[midpoint];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number, digits = 2) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function findBucket(value: number, buckets: Bucket[]) {
  return (
    buckets.find((bucket) => value >= bucket.min && value < bucket.max) ??
    buckets[buckets.length - 1]
  );
}

function runRegression(points: Array<{ x: number; y: number }>): RegressionResult {
  const validPoints = points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
  );
  const observations = validPoints.length;

  if (observations < 3) {
    return { slope: 0, intercept: 0, rSquared: 0, observations };
  }

  const xMean = average(validPoints.map((point) => point.x));
  const yMean = average(validPoints.map((point) => point.y));
  let sxx = 0;
  let syy = 0;
  let sxy = 0;

  for (const point of validPoints) {
    const xDelta = point.x - xMean;
    const yDelta = point.y - yMean;
    sxx += xDelta * xDelta;
    syy += yDelta * yDelta;
    sxy += xDelta * yDelta;
  }

  if (sxx === 0) {
    return { slope: 0, intercept: yMean, rSquared: 0, observations };
  }

  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const rSquared = syy === 0 ? 0 : clamp((sxy * sxy) / (sxx * syy), 0, 1);

  return { slope, intercept, rSquared, observations };
}

function estimateLinearDemand(records: PricingRecord[]) {
  const points = records.map((record) => ({
    x: record.price,
    y: record.units_sold,
  }));
  return runRegression(points);
}

function predictLinearDemand(model: RegressionResult, price: number) {
  return Math.max(0, model.intercept + model.slope * price);
}

export function getCategories(records: PricingRecord[]) {
  return Array.from(new Set(records.map((record) => record.product_category))).sort();
}

export function getDateExtent(records: PricingRecord[]) {
  const dates = records.map((record) => record.date).sort();
  return {
    minDate: dates[0] ?? "",
    maxDate: dates[dates.length - 1] ?? "",
  };
}

export function filterPricingRecords(records: PricingRecord[], filters: FilterOptions) {
  return records.filter((record) => {
    const categoryMatch =
      !filters.category ||
      filters.category === ALL_CATEGORIES ||
      record.product_category === filters.category;
    const startMatch = !filters.startDate || record.date >= filters.startDate;
    const endMatch = !filters.endDate || record.date <= filters.endDate;
    return categoryMatch && startMatch && endMatch;
  });
}

export function estimatePriceElasticity(records: PricingRecord[]): ElasticityResult {
  // Log-log regression lets the price coefficient be read as an elasticity:
  // roughly the percent conversion change expected from a 1% price change.
  const points = records
    .filter((record) => record.price > 0 && record.conversion_rate > 0)
    .map((record) => ({
      x: Math.log(record.price),
      y: Math.log(record.conversion_rate),
    }));
  const regression = runRegression(points);

  return {
    elasticity: regression.slope,
    intercept: regression.intercept,
    rSquared: regression.rSquared,
    observations: regression.observations,
  };
}

export function summarizeMetrics(records: PricingRecord[]): DashboardMetrics {
  const productCount = new Set(records.map((record) => record.product_id)).size;
  const totalRevenue = sum(records, (record) => record.price * record.units_sold);
  const totalUnits = sum(records, (record) => record.units_sold);
  const totalPageViews = sum(records, (record) => record.page_views);
  const overallElasticity = estimatePriceElasticity(records).elasticity;

  return {
    productCount,
    totalRevenue,
    totalUnits,
    totalPageViews,
    overallConversion: totalPageViews === 0 ? 0 : totalUnits / totalPageViews,
    avgOrderPrice: totalUnits === 0 ? 0 : totalRevenue / totalUnits,
    overallElasticity,
  };
}

export function summarizeProducts(records: PricingRecord[]): ProductSummary[] {
  const grouped = groupByProduct(records);
  const products = Array.from(grouped.entries()).map(([productId, productRecords]) => {
    const firstRecord = productRecords[0];
    const pageViews = sum(productRecords, (record) => record.page_views);
    const unitsSold = sum(productRecords, (record) => record.units_sold);
    const revenue = sum(productRecords, (record) => record.price * record.units_sold);
    const uniqueDays = new Set(productRecords.map((record) => record.date)).size || 1;
    const elasticity = estimatePriceElasticity(productRecords);

    return {
      productId,
      productName: firstRecord.product_name,
      category: firstRecord.product_category,
      avgPrice: average(productRecords.map((record) => record.price)),
      avgConversion: pageViews === 0 ? 0 : unitsSold / pageViews,
      pageViews,
      unitsSold,
      revenue,
      elasticity: elasticity.elasticity,
      elasticityRSquared: elasticity.rSquared,
      segment: elasticity.elasticity <= -1 ? "Elastic" : "Inelastic",
      quadrant: "",
      avgDailyUnits: unitsSold / uniqueDays,
      observationCount: productRecords.length,
    } satisfies ProductSummary;
  });

  const priceMedian = median(products.map((product) => product.avgPrice));
  const conversionMedian = median(products.map((product) => product.avgConversion));

  return products
    .map((product) => {
      const priceBand = product.avgPrice >= priceMedian ? "High price" : "Low price";
      const conversionBand =
        product.avgConversion >= conversionMedian
          ? "High conversion"
          : "Low conversion";
      return {
        ...product,
        quadrant: `${priceBand} / ${conversionBand}`,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export function getPriceBucketSummaries(
  records: PricingRecord[]
): PriceBucketSummary[] {
  const grouped = new Map<string, PricingRecord[]>();

  for (const record of records) {
    const bucket = findBucket(record.price, PRICE_BUCKETS);
    const existing = grouped.get(bucket.label);
    if (existing) {
      existing.push(record);
    } else {
      grouped.set(bucket.label, [record]);
    }
  }

  return PRICE_BUCKETS.map((bucket) => {
    const bucketRecords = grouped.get(bucket.label) ?? [];
    const pageViews = sum(bucketRecords, (record) => record.page_views);
    const unitsSold = sum(bucketRecords, (record) => record.units_sold);

    return {
      bucket: bucket.label,
      min: bucket.min,
      max: bucket.max,
      avgConversion: pageViews === 0 ? 0 : unitsSold / pageViews,
      revenue: sum(bucketRecords, (record) => record.price * record.units_sold),
      unitsSold,
      pageViews,
      records: bucketRecords.length,
    };
  }).filter((bucket) => bucket.records > 0);
}

function buildOpportunity(
  product: ProductSummary,
  productRecords: PricingRecord[]
): PriceOpportunity | null {
  if (productRecords.length < 14) {
    return null;
  }

  const currentPrice = product.avgPrice;
  const model = estimateLinearDemand(productRecords);
  const lowerBound = Math.max(1, currentPrice * 0.75);
  const upperBound = currentPrice * 1.25;
  let recommendedPrice = currentPrice;
  let currentDailyUnits = product.avgDailyUnits;
  let projectedDailyUnits = product.avgDailyUnits;

  // A simple product-level demand curve gives a finite revenue maximum:
  // units = intercept + slope * price, revenue = price * units.
  if (model.slope < -0.01 && model.intercept > 0) {
    const rawOptimalPrice = -model.intercept / (2 * model.slope);
    recommendedPrice = clamp(rawOptimalPrice, lowerBound, upperBound);
    currentDailyUnits = predictLinearDemand(model, currentPrice);
    projectedDailyUnits = predictLinearDemand(model, recommendedPrice);
  } else {
    const directionalChange = product.elasticity <= -1 ? -0.06 : 0.08;
    recommendedPrice = clamp(currentPrice * (1 + directionalChange), lowerBound, upperBound);
    projectedDailyUnits =
      product.avgDailyUnits * Math.pow(recommendedPrice / currentPrice, product.elasticity);
  }

  const currentDailyRevenue = currentPrice * currentDailyUnits;
  const projectedDailyRevenue = recommendedPrice * projectedDailyUnits;

  if (projectedDailyRevenue <= currentDailyRevenue) {
    return null;
  }

  const priceChangePct = ((recommendedPrice - currentPrice) / currentPrice) * 100;
  const confidence =
    model.rSquared >= 0.35 ? "High" : model.rSquared >= 0.18 ? "Medium" : "Directional";
  const verb = priceChangePct >= 0 ? "Increase" : "Lower";
  const riskNote =
    product.segment === "Inelastic"
      ? "conversion risk is comparatively modest"
      : "watch conversion closely because the product is price-sensitive";

  return {
    productId: product.productId,
    productName: product.productName,
    category: product.category,
    segment: product.segment,
    elasticity: product.elasticity,
    currentPrice: round(currentPrice, 2),
    recommendedPrice: round(recommendedPrice, 2),
    priceChangePct: round(priceChangePct, 1),
    currentDailyRevenue,
    projectedDailyRevenue,
    monthlyRevenueLift: Math.max(0, (projectedDailyRevenue - currentDailyRevenue) * 30),
    confidence,
    recommendation: `${verb} ${product.productName} by ${Math.abs(
      priceChangePct
    ).toFixed(1)}% to target $${recommendedPrice.toFixed(2)}; ${riskNote}.`,
  };
}

export function getTopOpportunities(records: PricingRecord[], limit = 8) {
  const grouped = groupByProduct(records);
  const products = summarizeProducts(records);
  return products
    .map((product) => {
      const productRecords = grouped.get(product.productId) ?? [];
      return buildOpportunity(product, productRecords);
    })
    .filter((opportunity): opportunity is PriceOpportunity => Boolean(opportunity))
    .sort((a, b) => b.monthlyRevenueLift - a.monthlyRevenueLift)
    .slice(0, limit);
}

export function getRevenueHeatmap(records: PricingRecord[]): RevenueHeatmapData {
  const cellMap = new Map<string, HeatmapCell>();

  for (const record of records) {
    const priceBucket = findBucket(record.price, PRICE_BUCKETS).label;
    const unitBucket = findBucket(record.units_sold, UNIT_BUCKETS).label;
    const key = `${priceBucket}|${unitBucket}`;
    const revenue = record.price * record.units_sold;
    const existing = cellMap.get(key);

    if (existing) {
      existing.revenue += revenue;
      existing.count += 1;
      existing.avgRevenue = existing.revenue / existing.count;
    } else {
      cellMap.set(key, {
        priceBucket,
        unitBucket,
        revenue,
        count: 1,
        avgRevenue: revenue,
      });
    }
  }

  const activePriceBuckets = PRICE_BUCKETS.filter((bucket) =>
    Array.from(cellMap.values()).some((cell) => cell.priceBucket === bucket.label)
  ).map((bucket) => bucket.label);
  const unitBuckets = [...UNIT_BUCKETS].reverse().map((bucket) => bucket.label);
  const cells = Array.from(cellMap.values());
  const maxRevenue = Math.max(0, ...cells.map((cell) => cell.revenue));

  return {
    priceBuckets: activePriceBuckets,
    unitBuckets,
    cells,
    maxRevenue,
  };
}

export function getRevenueCurve(
  records: PricingRecord[],
  productId?: string
): RevenueCurveAnalysis | null {
  const products = summarizeProducts(records);
  const selectedProduct =
    (productId ? products.find((product) => product.productId === productId) : null) ??
    products[0];

  if (!selectedProduct) {
    return null;
  }

  const productRecords = records.filter(
    (record) => record.product_id === selectedProduct.productId
  );
  const opportunity = buildOpportunity(selectedProduct, productRecords);

  if (!opportunity) {
    return null;
  }

  const model = estimateLinearDemand(productRecords);
  const currentPrice = selectedProduct.avgPrice;
  const minPrice = currentPrice * 0.75;
  const maxPrice = currentPrice * 1.25;
  const points: RevenueCurvePoint[] = Array.from({ length: 31 }, (_, index) => {
    const price = minPrice + ((maxPrice - minPrice) * index) / 30;
    const expectedUnits =
      model.slope < -0.01
        ? predictLinearDemand(model, price)
        : selectedProduct.avgDailyUnits *
          Math.pow(price / currentPrice, selectedProduct.elasticity);
    return {
      price: round(price, 2),
      expectedUnits,
      expectedRevenue: price * expectedUnits,
    };
  });

  return {
    product: selectedProduct,
    opportunity,
    points,
  };
}
