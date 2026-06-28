import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
};

export function ChartCard({ title, eyebrow, description, children }: ChartCardProps) {
  return (
    <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/60">
      <div className="mb-4 flex flex-col gap-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
