export type PricingRecord = {
  product_id: string;
  product_name: string;
  price: number;
  units_sold: number;
  page_views: number;
  conversion_rate: number;
  product_category: string;
  date: string;
};

export type ElasticitySegment = "Elastic" | "Inelastic";

export type RegressionResult = {
  slope: number;
  intercept: number;
  rSquared: number;
  observations: number;
};

export type ElasticityResult = {
  elasticity: number;
  intercept: number;
  rSquared: number;
  observations: number;
};

export type ProductSummary = {
  productId: string;
  productName: string;
  category: string;
  avgPrice: number;
  avgConversion: number;
  pageViews: number;
  unitsSold: number;
  revenue: number;
  elasticity: number;
  elasticityRSquared: number;
  segment: ElasticitySegment;
  quadrant: string;
  avgDailyUnits: number;
  observationCount: number;
};

export type PriceBucketSummary = {
  bucket: string;
  min: number;
  max: number;
  avgConversion: number;
  revenue: number;
  unitsSold: number;
  pageViews: number;
  records: number;
};

export type DashboardMetrics = {
  productCount: number;
  totalRevenue: number;
  totalUnits: number;
  totalPageViews: number;
  overallConversion: number;
  avgOrderPrice: number;
  overallElasticity: number;
};

export type HeatmapCell = {
  priceBucket: string;
  unitBucket: string;
  revenue: number;
  count: number;
  avgRevenue: number;
};

export type RevenueHeatmapData = {
  priceBuckets: string[];
  unitBuckets: string[];
  cells: HeatmapCell[];
  maxRevenue: number;
};

export type PriceOpportunity = {
  productId: string;
  productName: string;
  category: string;
  segment: ElasticitySegment;
  elasticity: number;
  currentPrice: number;
  recommendedPrice: number;
  priceChangePct: number;
  currentDailyRevenue: number;
  projectedDailyRevenue: number;
  monthlyRevenueLift: number;
  confidence: "High" | "Medium" | "Directional";
  recommendation: string;
};

export type RevenueCurvePoint = {
  price: number;
  expectedUnits: number;
  expectedRevenue: number;
};

export type RevenueCurveAnalysis = {
  product: ProductSummary;
  opportunity: PriceOpportunity;
  points: RevenueCurvePoint[];
};
