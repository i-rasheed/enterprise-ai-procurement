const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatRelativeTime(dateInput: string): string {
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function chartToSeries(chart?: {
  labels: string[];
  datasets: Array<{ label: string; data: number[] }>;
}) {
  if (!chart?.labels?.length) {
    return [];
  }

  const primary = chart.datasets[0];

  return chart.labels.map((label, index) => ({
    name: label,
    value: primary?.data[index] ?? 0,
  }));
}

export function chartToMultiSeries(chart?: {
  labels: string[];
  datasets: Array<{ label: string; data: number[] }>;
}) {
  if (!chart?.labels?.length) {
    return [];
  }

  return chart.labels.map((label, index) => {
    const point: Record<string, string | number> = { name: label };

    chart.datasets.forEach((dataset) => {
      point[dataset.label] = dataset.data[index] ?? 0;
    });

    return point;
  });
}
