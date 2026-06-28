import Image from "next/image";
import { Dashboard } from "../components/Dashboard";
import { getCategories, getDateExtent, summarizeMetrics } from "../lib/analysis";
import { getPricingRecords } from "../lib/data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function Home() {
  const records = getPricingRecords();
  const categories = getCategories(records);
  const { minDate, maxDate } = getDateExtent(records);
  const metrics = summarizeMetrics(records);

  return (
    <main className="min-h-screen bg-[#f5f6f3]">
      <header className="relative overflow-hidden border-b border-zinc-900/20 bg-zinc-950 text-white">
        <Image
          src="/pricing-analytics-hero.png"
          alt="E-commerce pricing analytics visual with product cards and chart overlays"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-zinc-950/60" />
        <div className="relative mx-auto flex min-h-[430px] max-w-7xl flex-col justify-end px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
            Ecommerce pricing analytics
          </p>
          <div className="mt-4 max-w-4xl">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Price Elasticity Conversion Dashboard
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-100 sm:text-lg">
              A portfolio analysis of how price changes shape conversion rate,
              revenue, and product-level pricing opportunities.
            </p>
          </div>
          <div className="mt-8 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/20 bg-white/20 text-sm sm:grid-cols-4">
            <div className="bg-zinc-950/55 p-4">
              <p className="text-zinc-300">Revenue</p>
              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(metrics.totalRevenue)}
              </p>
            </div>
            <div className="bg-zinc-950/55 p-4">
              <p className="text-zinc-300">Products</p>
              <p className="mt-1 text-xl font-semibold">{metrics.productCount}</p>
            </div>
            <div className="bg-zinc-950/55 p-4">
              <p className="text-zinc-300">Conversion</p>
              <p className="mt-1 text-xl font-semibold">
                {(metrics.overallConversion * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-zinc-950/55 p-4">
              <p className="text-zinc-300">Elasticity</p>
              <p className="mt-1 text-xl font-semibold">
                {metrics.overallElasticity.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Data source
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">
              Synthetic e-commerce pricing funnel dataset
            </h2>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-[#f5f6f3] p-4">
            <p className="text-sm font-semibold text-zinc-950">What the data covers</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Daily product observations for prices, units sold, page views,
              conversion rate, category, and date across 48 products and 6 retail
              categories.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-[#f5f6f3] p-4">
            <p className="text-sm font-semibold text-zinc-950">Where it comes from</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              The dataset is reproducibly generated in this repo with
              <span className="font-mono text-xs text-zinc-800">
                {" "}
                data/generate_dataset.js
              </span>
              . It is synthetic because public datasets rarely include price,
              traffic, units, and conversion together at product-day level.
            </p>
          </div>
        </div>
      </section>

      <Dashboard
        records={records}
        categories={categories}
        minDate={minDate}
        maxDate={maxDate}
      />

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              About this analysis
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
              Measuring price sensitivity in the funnel
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-zinc-600">
            <p>
              The underlying data is a synthetic online retail pricing funnel
              dataset generated for this project, covering January 1, 2025
              through June 30, 2025. It is designed to resemble product-day
              analytics data an e-commerce pricing analyst would use.
            </p>
            <p>
              The analysis estimates price elasticity of conversion with a
              log-log regression: log(conversion rate) is modeled as a function
              of log(price). The coefficient can be read as the expected
              percentage change in conversion for a 1% change in price.
            </p>
            <p>
              Products with elasticity below -1.0 are classified as elastic,
              meaning conversion is relatively sensitive to price. Products
              above -1.0 are treated as inelastic and may tolerate carefully
              tested price increases.
            </p>
            <p>
              The revenue recommendation uses a simple linear demand curve for
              each product, estimated from daily price and unit sales. This
              assumes product mix, traffic quality, and marketing exposure are
              stable enough over the selected window to make directional
              pricing tests useful.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
