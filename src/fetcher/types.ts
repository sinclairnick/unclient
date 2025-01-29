import { OperationConfig } from "../infer/infer";
import { Awaitable, FormatOptionals } from "../types";

export type FetcherReturn<TResult, TFetcherRes> = {
  [TKey in keyof TFetcherRes]: TKey extends "data"
    ? TResult
    : TFetcherRes[TKey];
};

export type FetcherConfigInputs = {
  body?: unknown;
  params?: unknown;
  query?: unknown;
};

export type FetcherConfig = {
  path: string;
  method: string;
} & FetcherConfigInputs;

export type Fetcher<TOpts extends unknown[] = any[], TResponse = unknown> = (
  config: FetcherConfig,
  ...opts: TOpts
) => Awaitable<TResponse>;

export type FetcherParams<TRoute extends OperationConfig, TOpts extends any[]> = [
  config: FormatOptionals<{
    params: TRoute["Params"];
    body: TRoute["Body"];
    query: TRoute["Query"];
  }>,
  ...opts: TOpts
];
