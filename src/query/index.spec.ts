import { describe, expectTypeOf, test } from "vitest";
import { createUnclient } from "../client/client";
import { init } from ".";

describe("Query", () => {
  test("Query correct return type", async () => {
    const client = createUnclient<{
      "GET /foo": {
        Output: {
          foo: "bar";
        };
      };
    }>()({
      fetcher: () => {
        return { data: {} };
      },
    });

    const { query } = init(client);
    const result = query("GET /foo", {});

    type Data = Awaited<ReturnType<(typeof result)["queryFn"]>>;

    expectTypeOf<Data>().toMatchTypeOf<{ data: { foo: "bar" } }>();
  });

  test("Mutation correct return type", async () => {
    const client = createUnclient<{
      "POST /foo": {
        Params: {
          baz: true;
        };
        Output: {
          foo: "bar";
        };
      };
    }>()({
      fetcher: () => {
        return { data: {} };
      },
    });

    const { mutation } = init(client);
    const result = mutation("POST /foo");

    type Vars = Parameters<(typeof result)["mutationFn"]>[0][0];
    type Data = Awaited<ReturnType<(typeof result)["mutationFn"]>>;

    expectTypeOf<Vars>().toMatchTypeOf<{ params: { baz: true } }>();
    expectTypeOf<Data>().toMatchTypeOf<{ data: { foo: "bar" } }>();
  });
});
