import type { ChartDataset } from "@/features/dashboard/types";

export function getChartVariant(
  chart: ChartDataset,
): "line" | "bar" | "pie" {
  const type = chart.type.toLowerCase();

  if (type === "pie") {
    return "pie";
  }

  if (type === "bar" || type === "stacked-bar") {
    return "bar";
  }

  return "line";
}

export function isCurrencyChart(chart: ChartDataset): boolean {
  const title = chart.title.toLowerCase();
  return (
    title.includes("spend") ||
    title.includes("saving") ||
    title.includes("value") ||
    title.includes("budget") ||
    title.includes("invoice")
  );
}
