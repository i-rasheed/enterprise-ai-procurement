import { describe, expect, it } from "vitest";

import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "@/features/dashboard/utils/formatters";

describe("dashboard formatters", () => {
  it("formats currency values", () => {
    expect(formatCurrency(1250)).toBe("$1,250");
  });

  it("formats compact currency values", () => {
    expect(formatCompactCurrency(1250000)).toMatch(/\$1\.3M|\$1\.2M/);
  });

  it("formats percentages", () => {
    expect(formatPercent(42.456)).toBe("42.5%");
  });
});
