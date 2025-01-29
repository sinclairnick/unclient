import { describe, expect, expectTypeOf, test } from "vitest";
import { createUnclient } from "./client";
import { TestAppDef } from "../test-util";

describe("Client", () => {
  type App = TestAppDef;

  test("Creates correct path param", () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    expectTypeOf<Parameters<(typeof client)["$create"]>[0]>().toEqualTypeOf<
      | "GET /hello"
      | "GET /bye"
      | "GET /with/implicit/:paramName"
      | "POST /hello"
      | "GET /with/explicit/:paramName"
    >();
  });

  test("Creates correct param types", () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const getHello = client.$create("GET /hello");
    type Config = Parameters<typeof getHello>[0];

    expectTypeOf<Config["body"]>().toBeUnknown();
    expectTypeOf<Config["params"]>().toBeUnknown();
    expectTypeOf<Config["query"]>().toEqualTypeOf<{ hi: number }>();
  });

  test("Creates correct body type", () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });
    const postHello = client.$create("POST /hello");
    type Config = Parameters<typeof postHello>[0];

    expectTypeOf<Config["body"]>().toEqualTypeOf<{ notHi: number }>();
    expectTypeOf<Config["params"]>().toBeUnknown();
    expectTypeOf<Config["query"]>().toBeUnknown();
  });

  test("Creates correct return type", () => {
    const client = createUnclient<App>()({
      fetcher: (config) => {
        return { data: {} };
      },
    });
    const getHello = client.$create("GET /hello");

    type Expectation = { data: { result: boolean } };
    type Actual = Awaited<ReturnType<typeof getHello>>;
    expectTypeOf<Actual>().toEqualTypeOf<Expectation>();
  });

  test("Creates correct return type with additional context (sync)", () => {
    const client = createUnclient<App>()({
      fetcher: (config) => {
        return { data: {}, b: 2 };
      },
    });
    const getHello = client.$create("GET /hello");

    type Expectation = { data: { result: boolean }; b: number };
    type Actual = Awaited<ReturnType<typeof getHello>>;
    expectTypeOf<Actual>().toEqualTypeOf<Expectation>();
  });

  test("Creates correct return type with additional context (async)", () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        return { data: {}, b: 2 };
      },
    });
    const getHello = client.$create("GET /hello");

    type Expectation = { data: { result: boolean }; b: number };
    type Actual = Awaited<ReturnType<typeof getHello>>;
    expectTypeOf<Actual>().toEqualTypeOf<Expectation>();
  });

  test("Manages no additionl param", () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        return { data: {} };
      },
    });

    const getHello = client.$create("GET /hello");
    expectTypeOf<Parameters<typeof getHello>["length"]>().toEqualTypeOf<1>();
  });

  test("Manages one additionl param", () => {
    const client = createUnclient<App>()({
      fetcher: async (config, options: { a: number }) => {
        return { data: {} };
      },
    });

    const getHello = client.$create("GET /hello");
    expectTypeOf<Parameters<typeof getHello>[1]>().toEqualTypeOf<{
      a: number;
    }>();
  });

  test("Manages multiple additional params", async () => {
    let val: Record<any, any> = {};

    const client = createUnclient<App>()({
      fetcher: async (
        config,
        options: { a: number },
        options2: { b: number }
      ) => {
        val = { options, options2 };

        return { data: {} };
      },
    });

    const getHello = client.$create("GET /hello");
    expectTypeOf<Parameters<typeof getHello>[1]>().toEqualTypeOf<{
      a: number;
    }>();
    expectTypeOf<Parameters<typeof getHello>[2]>().toEqualTypeOf<{
      b: number;
    }>();

    await getHello({} as any, { a: 1 }, { b: 2 });
    expect(val.options).toBeDefined();
    expect(val.options2).toBeDefined();
    expect(val.options.a).toBe(1);
    expect(val.options2.b).toBe(2);
  });

  test("Runs fetcher correctly", async () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        const res = { a: 2 };

        return { data: 1, ...res };
      },
    });

    const getHello = client.$create("GET /hello");

    const result = await getHello({
      query: { hi: 2 },
    });

    expect(result.data).toBe(1);
    expect(result.data).toBe(1);
  });

  test("Handles HTTP verbs", async () => {
    const client = createUnclient<App>()({
      fetcher: async (config) => {
        return { data: config.query };
      },
    });

    type Client = typeof client;

    expectTypeOf<keyof Client>().toEqualTypeOf<
      "$get" | "$post" | "$fetch" | "$create"
    >();
    expectTypeOf<Parameters<typeof client.$get<"/hello">>>().toEqualTypeOf<
      [
        "/hello",
        {
          query: { hi: number };
          params?: unknown;
          body?: unknown;
        }
      ]
    >();

    const result = await client.$get("/hello", {
      query: {
        hi: 2,
      },
    });

    expect(result.data).toEqual({ hi: 2 });
  });
});
