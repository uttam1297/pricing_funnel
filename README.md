# Price Elasticity Conversion Dashboard

This project explores the price elasticity of conversion in e-commerce and demonstrates how to identify revenue-optimizing price adjustments.

It is built as a professional analytics portfolio project for e-commerce and pricing analyst roles. The dashboard segments products by elasticity, compares conversion across price tiers, highlights revenue density, and recommends product-level pricing tests.

Live demo: [https://pricing-funnel.vercel.app](https://pricing-funnel.vercel.app)

## Technology Stack

- Next.js App Router
- Recharts for interactive charts
- Tailwind CSS for responsive dashboard styling
- Reproducible Node.js data generation script for the synthetic dataset
- Python/pandas can be used for initial data exploration if the dataset is extended later
- Vercel for deployment

## Dataset And Source

The project uses a realistic synthetic e-commerce dataset because most public datasets do not include product-level price, traffic, units sold, and conversion observations in one clean table.

The data is not taken from a private company or scraped marketplace. It is generated inside this repository with `data/generate_dataset.js` so the project is reproducible and deployable without external credentials. The synthetic data models daily product-level observations from an online retail catalog from January 1, 2025 through June 30, 2025.

Required columns are included:

- `product_id`
- `price`
- `units_sold`
- `page_views`
- `conversion_rate`
- `product_category`
- `date`

Additional display field:

- `product_name`

Files:

- `data/ecommerce_pricing_data.csv`
- `data/ecommerce_pricing_data.json`
- `data/generate_dataset.js`
- `data/DATA_DICTIONARY.md`

Regenerate the dataset:

```bash
npm run generate:data
```

## Analysis Methodology

The dashboard computes:

- Overall conversion rate by price bucket
- Log-log regression of `conversion_rate` on `price` to estimate price elasticity of conversion
- Elastic vs. inelastic product classification using an elasticity threshold of `-1.0`
- Product quadrants: high price / low conversion, low price / high conversion, and related combinations
- Revenue-maximizing price for a sample product using a simple linear demand curve
- Actionable product recommendations ranked by estimated monthly revenue lift

The log-log elasticity model is:

```text
log(conversion_rate) = alpha + beta * log(price) + error
```

`beta` is interpreted as the approximate percent change in conversion rate for a 1% change in price. The model assumes that traffic quality, promotion mix, and product availability are stable enough over the selected window for a directional pricing read.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Deploy on Vercel

This is a standard Next.js app deployed on Vercel:

- Production URL: [https://pricing-funnel.vercel.app](https://pricing-funnel.vercel.app)
- The repo includes `vercel.json` with `"framework": "nextjs"` so Vercel builds the App Router project correctly.
- This config prevents Vercel from treating the `public/` folder as the static output directory, which would otherwise cause a production `404: NOT_FOUND`.

1. Push the repo to GitHub.
2. Import it in Vercel.
3. Use the Next.js framework preset. The committed `vercel.json` enforces this automatically.
4. Keep the build command as `npm run build`.
5. Do not set the output directory to `public`.

Manual production deploy:

```bash
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

## Repository Structure

```text
app/                 App Router page and global styles
components/          Reusable dashboard, chart, filter, and table components
lib/                 Data loading and analysis functions
data/                Dataset, data dictionary, and generation script
public/              Static visual assets
```
