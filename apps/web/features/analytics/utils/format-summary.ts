import {
  formatCompactCurrency,
  formatNumber,
  formatPercent,
} from "@/features/dashboard/utils/formatters";

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function formatSummaryValue(key: string, value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("percent") ||
      lowerKey.includes("utilization") ||
      lowerKey.includes("rate") ||
      lowerKey.includes("consumption")
    ) {
      return formatPercent(value);
    }

    if (
      lowerKey.includes("spend") ||
      lowerKey.includes("budget") ||
      lowerKey.includes("saving") ||
      lowerKey.includes("value") ||
      lowerKey.includes("amount")
    ) {
      return formatCompactCurrency(value);
    }

    return formatNumber(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function summaryEntries(
  summary: Record<string, unknown>,
): Array<{ key: string; label: string; value: string }> {
  return Object.entries(summary).map(([key, value]) => ({
    key,
    label: formatKey(key),
    value: formatSummaryValue(key, value),
  }));
}

export function kpiEntries(
  kpis: Record<string, unknown>,
): Array<{ key: string; label: string; value: string }> {
  return Object.entries(kpis).map(([key, value]) => ({
    key,
    label: formatKey(key),
    value: formatSummaryValue(key, value),
  }));
}
