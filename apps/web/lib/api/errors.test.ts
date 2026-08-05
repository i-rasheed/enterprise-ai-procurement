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

  it("shortens prisma-style server errors to the real reason", () => {
    const axiosLike = {
      response: {
        status: 500,
        data: {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              'Invalid `prisma.user.findFirst()` invocation in /Users/mac/app.ts:11:29\n\nThe column `User.isPlatformAdmin` does not exist in the current database.',
          },
        },
      },
    };

    expect(getErrorMessage(axiosLike)).toBe(
      "The server database is not fully set up. Please try again later or contact support.",
    );
  });

  it("does not expose file paths from server errors", () => {
    const axiosLike = {
      response: {
        status: 500,
        data: {
          message:
            "Invalid `prisma.user.findFirst()` invocation in /Users/mac/app.ts:11:29",
        },
      },
    };

    expect(getErrorMessage(axiosLike)).toBe(
      "The server database is not fully set up. Please try again later or contact support.",
    );
  });
});
