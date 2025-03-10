import { OperationConfig } from "../infer/infer";
import { Awaitable, FormatOptionals, Strip } from "../types";

export type AnyFetcherRes = Record<PropertyKey, any>;

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

export type Fetcher<
  TOpts extends unknown[] = any[],
  TResponse extends AnyFetcherRes = AnyFetcherRes
> = (
  config: Record<PropertyKey, unknown> & FetcherConfig,
  ...opts: TOpts
) => Awaitable<TResponse>;

export type FetcherParams<
  TRoute extends OperationConfig,
  TOpts extends any[]
> = [
  config: Record<PropertyKey, unknown> &
    Strip<
      FormatOptionals<{
        params: TRoute["Params"];
        body: TRoute["Body"];
        query: TRoute["Query"];
      }>
    >,
  ...opts: TOpts
];
