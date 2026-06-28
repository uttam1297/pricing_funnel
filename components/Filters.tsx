"use client";

import { CalendarDays, Filter, RotateCcw } from "lucide-react";
import { ALL_CATEGORIES } from "../lib/analysis";

type FiltersProps = {
  categories: string[];
  selectedCategory: string;
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onCategoryChange: (category: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
};

export function Filters({
  categories,
  selectedCategory,
  startDate,
  endDate,
  minDate,
  maxDate,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: FiltersProps) {
  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <Filter aria-hidden="true" className="h-4 w-4 text-teal-700" />
            Analysis filters
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {minDate} to {maxDate} synthetic pricing observations
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[220px_170px_170px_auto]">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Category
            <select
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            >
              <option value={ALL_CATEGORIES}>{ALL_CATEGORIES}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Start date
            <span className="relative">
              <CalendarDays
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="date"
                value={startDate}
                min={minDate}
                max={maxDate}
                onChange={(event) => onStartDateChange(event.target.value)}
                className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            End date
            <span className="relative">
              <CalendarDays
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="date"
                value={endDate}
                min={minDate}
                max={maxDate}
                onChange={(event) => onEndDateChange(event.target.value)}
                className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
            </span>
          </label>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md border border-zinc-300 bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
