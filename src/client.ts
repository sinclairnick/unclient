import { ApiDef, ApiRoute, InferMethods } from "./infer";
import { Awaitable, FormatOptionals } from "./types";

export type FetcherReturn<TResult, TFetcherRes> = {
  [TKey in keyof TFetcherRes]: TKey extends "data"
    ? TResult
    : TFetcherRes[TKey];
};

export type FetcherConfig = {
  path: string;
  method: string;
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export type Fetcher<
  TOpts extends unknown[] = unknown[],
  TResponse = unknown
> = (config: FetcherConfig, ...opts: TOpts) => Awaitable<TResponse>;

type UnclientOptions<
  TOpts extends unknown[] = unknown[],
  TResponse = unknown
> = { fetcher: Fetcher<TOpts, TResponse> };

export type Unclient<
  TApp extends ApiDef,
  TFetcher extends Fetcher<any, any>
> = <TKey extends keyof TApp & string>(
  key: TKey
) => TApp[TKey] extends infer TEndpoint extends ApiRoute
  ? TFetcher extends Fetcher<infer TOpts, infer TResponse>
    ? (
        config: FormatOptionals<{
          params: TEndpoint["Params"];
          body: TEndpoint["Body"];
          query: TEndpoint["Query"];
        }>,
        ...args: TOpts
      ) => Promise<FetcherReturn<TEndpoint["Output"], TResponse>>
    : never
  : never;

export const createUnclient = <TApp extends ApiDef>() => {
  return <TConfig extends UnclientOptions<any, any>>(
    config: TConfig
  ): Unclient<TApp, TConfig["fetcher"]> => {
    return (operation) => {
      const [methodUpper, pathPattern] = operation.split(" ");

      const fn: any = async (...args: any[]) => {
        return config.fetcher(
          {
            path: pathPattern,
            method: methodUpper.toLowerCase(),
            ...args[0],
          },
          args[1]
        );
      };

      return fn;
    };
  };
};

// Experimental `.get(path)` API approach
type UnclientMethods<
  TApp extends ApiDef,
  TFetcher extends Fetcher<any, any>
> = {
  [$Method in InferMethods<TApp> as Lowercase<$Method>]: <
    $Key extends Extract<keyof TApp, `${$Method} ${string}`>
  >(
    key: $Key extends `${$Method} ${infer $Path}` ? $Path : never
  ) => TApp[$Key] extends infer TEndpoint extends ApiRoute
    ? TFetcher extends Fetcher<infer TOpts, infer TResponse>
      ? (
          config: FormatOptionals<{
            params: TEndpoint["Params"];
            body: TEndpoint["Body"];
            query: TEndpoint["Query"];
          }>,
          ...args: TOpts
        ) => Promise<FetcherReturn<TEndpoint["Output"], TResponse>>
      : never
    : never;
};
