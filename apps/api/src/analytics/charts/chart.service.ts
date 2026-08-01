import { Injectable } from '@nestjs/common';

import { ChartDatasetDto } from '../dto/analytics-response.dto';
import { groupByMonth, topN } from '../utils/analytics.utils';

type ChartPoint = { label: string; value: number };

@Injectable()
export class ChartService {
  barChart(title: string, data: ChartPoint[]): ChartDatasetDto {
    return {
      type: 'bar',
      title,
      labels: data.map((d) => d.label),
      datasets: [{ label: title, data: data.map((d) => d.value) }],
    };
  }

  lineChart(
    title: string,
    labels: string[],
    series: { name: string; data: number[] }[],
  ): ChartDatasetDto {
    return {
      type: 'line',
      title,
      labels,
      datasets: series.map((s) => ({ label: s.name, data: s.data })),
    };
  }

  pieChart(title: string, data: ChartPoint[]): ChartDatasetDto {
    return {
      type: 'pie',
      title,
      labels: data.map((d) => d.label),
      datasets: [{ label: title, data: data.map((d) => d.value) }],
    };
  }

  areaChart(title: string, labels: string[], data: number[]): ChartDatasetDto {
    return {
      type: 'area',
      title,
      labels,
      datasets: [{ label: title, data }],
    };
  }

  stackedBarChart(
    title: string,
    labels: string[],
    series: { name: string; data: number[] }[],
  ): ChartDatasetDto {
    return {
      type: 'stacked-bar',
      title,
      labels,
      datasets: series.map((s) => ({ label: s.name, data: s.data })),
    };
  }

  timeSeries(
    title: string,
    points: { date: string; value: number }[],
  ): ChartDatasetDto {
    return {
      type: 'time-series',
      title,
      labels: points.map((p) => p.date),
      datasets: [{ label: title, data: points.map((p) => p.value) }],
    };
  }

  buildSpendByCategory(
    items: {
      vendor: { category: string | null };
      totalAmount: number | { toString(): string };
    }[],
  ): ChartDatasetDto {
    const data = topN(
      items,
      (i) => i.vendor.category ?? 'Uncategorized',
      (i) => Number(i.totalAmount),
    ).map((d) => ({ label: d.name, value: d.value }));
    return this.pieChart('Spend by Category', data);
  }

  buildMonthlyTrend<T>(
    items: T[],
    dateFn: (item: T) => Date,
    valueFn: (item: T) => number,
    title: string,
  ): ChartDatasetDto {
    const monthly = groupByMonth(items, dateFn, valueFn);
    return this.timeSeries(
      title,
      monthly.map((m) => ({ date: m.month, value: m.value })),
    );
  }
}
