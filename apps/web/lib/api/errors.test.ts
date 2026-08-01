import { describe, expect, it } from "vitest";

import { ApiClientError, getErrorMessage } from "@/lib/api/errors";

describe("api errors", () => {
  it("preserves ApiClientError messages", () => {
    const error = new ApiClientError("Unauthorized", 401, "UNAUTHORIZED");
    expect(getErrorMessage(error)).toBe("Unauthorized");
  });

  it("wraps unknown errors", () => {
    expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
  });
});
