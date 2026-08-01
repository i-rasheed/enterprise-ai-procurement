"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartDataset } from "@/features/dashboard/types";
import {
  chartToSeries,
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "@/features/dashboard/utils/formatters";

function fallbackColors(index: number) {
  const palette = ["#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626"];
  return palette[index % palette.length];
}

type DashboardChartProps = {
  chart: ChartDataset;
  variant: "line" | "bar" | "pie";
  valueFormatter?: (value: number) => string;
  emptyMessage?: string;
};

export function DashboardChart({
  chart,
  variant,
  valueFormatter = formatCompactCurrency,
  emptyMessage = "No chart data available yet.",
}: DashboardChartProps) {
  const data = chartToSeries(chart);
  const hasData = data.some((item) => item.value > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{chart.title}</CardTitle>
        <CardDescription>
          {variant === "line" ? "Trend over time" : "Distribution breakdown"}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        {!hasData ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            {emptyMessage}
          </div>
        ) : variant === "pie" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={fallbackColors(index)}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => valueFormatter(Number(value ?? 0))}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : variant === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => formatCompactCurrency(Number(value))}
              />
              <Tooltip
                formatter={(value) => valueFormatter(Number(value ?? 0))}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) =>
                  chart.title.toLowerCase().includes("spend") ||
                  chart.title.toLowerCase().includes("saving")
                    ? formatCompactCurrency(Number(value))
                    : formatNumber(Number(value))
                }
              />
              <Tooltip
                formatter={(value) =>
                  chart.title.toLowerCase().includes("spend") ||
                  chart.title.toLowerCase().includes("saving")
                    ? formatCurrency(Number(value ?? 0))
                    : formatNumber(Number(value ?? 0))
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="bg-muted h-5 w-40 animate-pulse rounded" />
        <div className="bg-muted mt-2 h-3 w-28 animate-pulse rounded" />
      </CardHeader>
      <CardContent className="h-[280px]">
        <div className="bg-muted/60 h-full animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  );
}
