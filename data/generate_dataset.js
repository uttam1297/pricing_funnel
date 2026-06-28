/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");

let seed = 20250219;

function random() {
  seed += 0x6d2b79f5;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function normal(mean = 0, standardDeviation = 1) {
  const u = 1 - random();
  const v = random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * standardDeviation;
}

function randomBetween(min, max) {
  return min + (max - min) * random();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, digits = 2) {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

const categoryConfigs = {
  Electronics: {
    price: [59, 449],
    conversion: [0.012, 0.043],
    views: [780, 2400],
    elasticity: [-2.05, -1.1],
  },
  "Home & Kitchen": {
    price: [18, 169],
    conversion: [0.026, 0.082],
    views: [520, 1700],
    elasticity: [-1.45, -0.68],
  },
  Beauty: {
    price: [8, 79],
    conversion: [0.052, 0.15],
    views: [620, 2200],
    elasticity: [-1.18, -0.48],
  },
  Apparel: {
    price: [16, 139],
    conversion: [0.028, 0.095],
    views: [570, 1900],
    elasticity: [-1.75, -0.82],
  },
  Fitness: {
    price: [24, 249],
    conversion: [0.018, 0.074],
    views: [430, 1450],
    elasticity: [-1.55, -0.72],
  },
  Grocery: {
    price: [4, 38],
    conversion: [0.085, 0.235],
    views: [720, 2600],
    elasticity: [-0.86, -0.22],
  },
};

const productNames = {
  Electronics: [
    "Wireless Earbuds",
    "USB-C Docking Hub",
    "Smart Home Camera",
    "Portable Charger",
    "Bluetooth Speaker",
    "Gaming Keyboard",
    "Streaming Microphone",
    "Fitness Smartwatch",
  ],
  "Home & Kitchen": [
    "Ceramic Cookware Set",
    "Air Fryer Basket",
    "Memory Foam Pillow",
    "Countertop Blender",
    "Cotton Sheet Set",
    "Desk Organizer",
    "LED Floor Lamp",
    "Vacuum Storage Bags",
  ],
  Beauty: [
    "Hydrating Face Serum",
    "Mineral Sunscreen",
    "Retinol Night Cream",
    "Matte Lip Kit",
    "Scalp Care Tonic",
    "Fragrance Discovery Set",
    "Reusable Makeup Pads",
    "Volumizing Hair Brush",
  ],
  Apparel: [
    "Performance Hoodie",
    "Running Shorts",
    "Stretch Denim Jeans",
    "Linen Button Shirt",
    "Seamless Leggings",
    "Merino Crew Socks",
    "Canvas Weekender Bag",
    "Rain Shell Jacket",
  ],
  Fitness: [
    "Adjustable Dumbbell",
    "Yoga Mat Pro",
    "Resistance Band Kit",
    "Foam Roller",
    "Cycling Trainer Stand",
    "Hydration Vest",
    "Recovery Massage Gun",
    "Balance Board",
  ],
  Grocery: [
    "Organic Coffee Beans",
    "Protein Granola",
    "Sparkling Water Pack",
    "Olive Oil Tin",
    "Dried Mango Slices",
    "Plant-Based Jerky",
    "Almond Butter Jar",
    "Herbal Tea Sampler",
  ],
};

const products = [];
let productCounter = 1001;

for (const [category, config] of Object.entries(categoryConfigs)) {
  productNames[category].forEach((name, categoryIndex) => {
    products.push({
      product_id: `P-${productCounter++}`,
      product_name: name,
      product_category: category,
      category_index: categoryIndex,
      base_price: randomBetween(config.price[0], config.price[1]),
      base_conversion: randomBetween(config.conversion[0], config.conversion[1]),
      base_views: randomBetween(config.views[0], config.views[1]),
      elasticity: randomBetween(config.elasticity[0], config.elasticity[1]),
      pricing_bias: randomBetween(-0.12, 0.12),
      seasonality_phase: randomBetween(0, Math.PI * 2),
      popularity: randomBetween(0.82, 1.18),
    });
  });
}

const start = new Date(Date.UTC(2025, 0, 1));
const end = new Date(Date.UTC(2025, 5, 30));
const records = [];

for (
  let cursor = new Date(start), dayIndex = 0;
  cursor <= end;
  cursor.setUTCDate(cursor.getUTCDate() + 1), dayIndex += 1
) {
  const date = cursor.toISOString().slice(0, 10);
  const weekday = cursor.getUTCDay();
  const weekendTraffic = weekday === 0 || weekday === 6 ? 1.11 : 0.97;
  const paydayLift = cursor.getUTCDate() >= 1 && cursor.getUTCDate() <= 5 ? 1.09 : 1;

  for (const product of products) {
    const promoWindow =
      (dayIndex + product.category_index * 5 + product.product_id.length) % 43 < 6;
    const premiumTest =
      (dayIndex + product.category_index * 9 + product.product_id.charCodeAt(2)) %
        67 <
      8;
    const pricePulse = Math.sin(dayIndex / 13 + product.seasonality_phase) * 0.035;
    const promoDiscount = promoWindow ? -randomBetween(0.08, 0.2) : 0;
    const premiumIncrease = premiumTest ? randomBetween(0.05, 0.13) : 0;
    const noisyPrice = normal(0, 0.018);
    const price =
      product.base_price *
      (1 +
        product.pricing_bias +
        pricePulse +
        promoDiscount +
        premiumIncrease +
        noisyPrice);

    const priceRatio = Math.max(price / product.base_price, 0.1);
    const trafficSeasonality =
      1 + Math.sin(dayIndex / 22 + product.seasonality_phase) * 0.08;
    const conversionSeasonality =
      1 + Math.cos(dayIndex / 19 + product.seasonality_phase) * 0.065;
    const trafficNoise = Math.exp(normal(0, 0.14));
    const conversionNoise = Math.exp(normal(0, 0.085));
    const pageViews = Math.max(
      80,
      Math.round(
        product.base_views *
          product.popularity *
          weekendTraffic *
          paydayLift *
          trafficSeasonality *
          trafficNoise
      )
    );
    const expectedConversion = clamp(
      product.base_conversion *
        Math.pow(priceRatio, product.elasticity) *
        conversionSeasonality *
        conversionNoise,
      0.003,
      0.32
    );
    const expectedUnits = pageViews * expectedConversion;
    const unitsSold = Math.max(
      0,
      Math.round(expectedUnits + normal(0, Math.sqrt(expectedUnits) * 0.72))
    );
    const conversionRate = unitsSold / pageViews;

    records.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price: round(price, 2),
      units_sold: unitsSold,
      page_views: pageViews,
      conversion_rate: round(conversionRate, 4),
      product_category: product.product_category,
      date,
    });
  }
}

const columns = [
  "product_id",
  "product_name",
  "price",
  "units_sold",
  "page_views",
  "conversion_rate",
  "product_category",
  "date",
];

function csvEscape(value) {
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

const dataDirectory = __dirname;
fs.writeFileSync(
  path.join(dataDirectory, "ecommerce_pricing_data.json"),
  `${JSON.stringify(records, null, 2)}\n`
);
fs.writeFileSync(
  path.join(dataDirectory, "ecommerce_pricing_data.csv"),
  `${columns.join(",")}\n${records
    .map((record) => columns.map((column) => csvEscape(record[column])).join(","))
    .join("\n")}\n`
);

console.log(`Generated ${records.length.toLocaleString("en-US")} rows.`);
console.log(`Products: ${products.length}`);
console.log(`Date range: ${records[0].date} to ${records[records.length - 1].date}`);
