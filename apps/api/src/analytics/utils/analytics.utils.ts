import { Decimal } from '@prisma/client/runtime/library';

export function toNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === 'number' ? value : Number(value);
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function daysBetween(start: Date, end: Date): number {
  return hoursBetween(start, end) / 24;
}

export type MonthlyAggregate = { month: string; value: number };

export function groupByMonth<T>(
  items: T[],
  dateFn: (item: T) => Date,
  valueFn: (item: T) => number,
): MonthlyAggregate[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const date = dateFn(item);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + valueFn(item));
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));
}

export function topN<T>(
  items: T[],
  keyFn: (item: T) => string,
  valueFn: (item: T) => number,
  limit = 5,
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + valueFn(item));
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
