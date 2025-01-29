import { describe, expect, expectTypeOf, test } from "vitest";
import z from "zod";
import { defineApi, InferRuntimeApiDef } from "./runtime";
import { createUnclient } from "../client/client";

describe("Runtime", () => {
  test("Infers operation paths", () => {
    const api = defineApi({
      "GET /foo": {},
      "POST /bar": {},
    });

    type Api = InferRuntimeApiDef<typeof api>;

    expectTypeOf<keyof Api>().toEqualTypeOf<"GET /foo" | "POST /bar">();
  });

  test("Infers parts", () => {
    const api = defineApi({
      "GET /foo": {
        Query: z.object({
          foo: z.literal("baz"),
        }),
        Body: z.object({
          foo: z.literal("bar"),
        }),
      },
    });

    type Api = InferRuntimeApiDef<typeof api>;

    expectTypeOf<Api["GET /foo"]["Query"]>().toEqualTypeOf<{ foo: "baz" }>();
    expectTypeOf<Api["GET /foo"]["Body"]>().toEqualTypeOf<{ foo: "bar" }>();
  });

  test("Uses in type for input parts", () => {
    const api = defineApi({
      "GET /foo": {
        Query: z.object({
          foo: z.number().transform(String),
        }),
      },
    });

    type Api = InferRuntimeApiDef<typeof api>;

    expectTypeOf<Api["GET /foo"]["Query"]>().toEqualTypeOf<{ foo: number }>;
  });

  test("Uses out type for output parts", () => {
    const api = defineApi({
      "GET /foo": {
        Output: z.object({
          foo: z.number().transform(String),
        }),
      },
    });

    type Api = InferRuntimeApiDef<typeof api>;

    expectTypeOf<Api["GET /foo"]["Output"]>().toEqualTypeOf<{ foo: string }>;
  });

  test("Parses input with provided schema", async () => {
    let query: any;

    const client = createUnclient({
      "GET /foo": {
        Query: z.object({
          limit: z.number().transform(String),
        }),
      },
    })({
      fetcher: (config) => {
        query = config.query;
      },
    });

    await client.$fetch("GET /foo", { query: { limit: 1 } });

    expect(query.limit).toBe("1");
  });

  test("Adds operation methods when using api param", async () => {
    let query: any;

    const client = createUnclient({
      "GET /foo": {
        Query: z.object({
          limit: z.number().transform(String),
        }),
      },
    })({
      fetcher: (config) => {
        query = config.query;
      },
    });

    await client.getFoo({ query: { limit: 1 } });

    expect(query.limit).toBe("1");
  });
});
