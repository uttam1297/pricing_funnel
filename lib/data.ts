import pricingRecords from "../data/ecommerce_pricing_data.json";
import type { PricingRecord } from "./types";

export function getPricingRecords(): PricingRecord[] {
  return pricingRecords as PricingRecord[];
}
