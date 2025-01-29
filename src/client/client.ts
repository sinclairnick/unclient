import { parse, Parser } from "schema-shift";
import { ApiDef, OperationConfig } from "../infer/infer";
import { InferRuntimeApiDef, RuntimeApiDef } from "../runtime/runtime";
import { HttpVerb } from "../types";
import {
  Unclient,
  UnclientCreate,
  UnclientHttpMethods,
  UnclientOperations,
  UnclientOptions,
} from "./types";
import { FetcherConfigInputs } from "../fetcher/types";

const parseInputs = async (
  Schema: OperationConfig<Parser>,
  inputs?: FetcherConfigInputs
) => {
  const [query, params, body] = await Promise.all([
    Schema.Query ? parse(Schema.Query, inputs?.query) : inputs?.query,
    Schema.Params ? parse(Schema.Params, inputs?.params) : inputs?.params,
    Schema.Body ? parse(Schema.Body, inputs?.body) : inputs?.body,
  ]);

  return { query, params, body };
};

const formatMethod = (method: string) => {
  switch (method) {
    case "GET": {
      return "get";
    }
    case "POST": {
      return "create";
    }
    case "PUT": {
      return "update";
    }
    default: {
      return method.toLowerCase();
    }
  }
};

const deriveOperationName = (key: string) => {
  const [method, path] = key.split(" ");
  const parts = path.split("/");

  let name = "";

  for (const part of parts) {
    if (part.startsWith(":")) {
      name += "By" + part[1].toUpperCase() + part.slice(2);
      continue;
    }
    if (part.startsWith("{")) {
      const _part = part.replace(/^{(.*)}$/, "$1");
      name += "By" + _part[0].toUpperCase() + part.slice(1);
      continue;
    }
    if (part.length > 0) {
      name += part[0].toUpperCase() + part.slice(1);
    }
  }

  return formatMethod(method) + name;
};

const HttpVerbs: Set<HttpVerb> = new Set([
  "delete",
  "get",
  "patch",
  "post",
  "put",
]);

// With type only
export function createUnclient<TApi extends ApiDef>(): <
  TConfig extends UnclientOptions<any, any>
>(
  config: TConfig
) => Unclient<TApi, TConfig["fetcher"]>;

// With api value
export function createUnclient<TRuntimeApi extends RuntimeApiDef>(
  api: TRuntimeApi
): <TConfig extends UnclientOptions<any, any>>(
  config: TConfig
) => Unclient<InferRuntimeApiDef<TRuntimeApi>, TConfig["fetcher"]> &
  UnclientOperations<InferRuntimeApiDef<TRuntimeApi>, TConfig["fetcher"]>;

// Impl.
export function createUnclient(api?: RuntimeApiDef) {
  return (config: UnclientOptions<any, any>) => {
    const fetch = async (operation: string, inputs: any, ...rest: any[]) => {
      const [methodUpper, pathPattern] = operation.split(" ");
      const Schema = api?.[operation as keyof typeof api] ?? {};

      const response = await config.fetcher(
        {
          ...inputs,
          path: pathPattern,
          method: methodUpper.toLowerCase(),
          ...(await parseInputs(Schema, inputs)),
        },
        ...rest
      );

      if (Schema.Output) {
        return {
          ...response,
          data: parse(Schema.Output, response.data),
        };
      }

      return response;
    };

    const create = ((operation) => {
      return async (inputs, ...rest) => {
        return fetch(operation, inputs, ...rest);
      };
    }) as UnclientCreate;

    const httpMethods: Partial<UnclientHttpMethods> = {};

    for (const verb of HttpVerbs) {
      httpMethods[`$${verb}`] = (path, inputs, ...rest) => {
        const operation = `${verb.toUpperCase()} ${path}`;

        return fetch(operation, inputs, ...rest);
      };
    }

    const operations: Partial<UnclientOperations> = {};

    if (api) {
      for (const key in api) {
        const name = deriveOperationName(key);

        operations[name as keyof typeof operations] = (input, ...rest) => {
          return fetch(key, input, ...rest);
        };
      }
    }

    return {
      $create: create,
      $fetch: fetch,
      ...httpMethods,
      ...operations,
    };
  };
}
