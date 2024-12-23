import { describe, expectTypeOf, test } from "vitest";
import { DefineApi } from "./infer";
import { createUnclient } from "./client";

describe("Infer", () => {
  test("should infer routes", () => {
    type AppDef = DefineApi<{
      "GET /posts": {
        Query: {
          limit?: number;
        };
      };
      "POST /post/:id": {
        Params: {
          id: number;
        };
        Output: {
          x: string;
        };
      };
    }>;

    const client = createUnclient<AppDef>()({
      fetcher: () => {
        return { data: {} };
      },
    });

    client("GET /posts");

    expectTypeOf<AppDef["GET /posts"]["Query"]>().toEqualTypeOf<{
      limit?: number;
    }>();
    expectTypeOf<AppDef["POST /post/:id"]["Params"]>().toEqualTypeOf<{
      id: number;
    }>();
  });
});
