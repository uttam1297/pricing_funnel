import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "teal" | "coral" | "amber" | "zinc";
};

const toneClasses = {
  teal: "bg-teal-50 text-teal-800 ring-teal-100",
  coral: "bg-rose-50 text-rose-800 ring-rose-100",
  amber: "bg-amber-50 text-amber-800 ring-amber-100",
  zinc: "bg-zinc-100 text-zinc-800 ring-zinc-200",
};

export function MetricCard({ label, value, detail, icon: Icon, tone }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/60">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-600">{label}</p>
        <span className={`rounded-md p-2 ring-1 ${toneClasses[tone]}`}>
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
    </div>
  );
}
