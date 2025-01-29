import { Fetcher, FetcherReturn, FetcherParams } from "../fetcher/types";
import {
  ApiDef,
  InferFetcherOpts,
  InferFetcherResponse,
  InferMethods,
  OperationConfig,
} from "../infer/infer";

export type UnclientOptions<
  TOpts extends unknown[] = unknown[],
  TResponse = unknown
> = { fetcher: Fetcher<TOpts, TResponse> };

export type ClientResponse<
  TOp extends OperationConfig,
  TFetcher extends Fetcher
> = Promise<FetcherReturn<TOp["Output"], InferFetcherResponse<TFetcher>>>;

export type UnclientCreate<
  TApi extends ApiDef = ApiDef,
  TFetcher extends Fetcher<any, any> = Fetcher
> = <TKey extends keyof TApi & `${string} ${string}`>(
  key: TKey
) => (
  ...params: FetcherParams<TApi[TKey], InferFetcherOpts<TFetcher>>
) => ClientResponse<TApi[TKey], TFetcher>;

export type UnclientFetch<
  TApi extends ApiDef = ApiDef,
  TFetcher extends Fetcher = Fetcher
> = <TKey extends keyof TApi & `${string} ${string}`>(
  key: TKey,
  ...params: FetcherParams<TApi[TKey], InferFetcherOpts<TFetcher>>
) => ClientResponse<TApi[TKey], TFetcher>;

export type UnclientHttpMethods<
  TApi extends ApiDef = ApiDef,
  TFetcher extends Fetcher = Fetcher
> = {
  [$Method in InferMethods<TApi> as `$${Lowercase<$Method>}`]: <
    TPath extends Extract<
      keyof TApi,
      `${$Method} ${string}`
    > extends `${string} ${infer $Path}`
      ? $Path
      : never
  >(
    path: TPath,
    ...params: FetcherParams<
      TApi[`${$Method} ${TPath}`],
      InferFetcherOpts<TFetcher>
    >
  ) => ClientResponse<TApi[`${$Method} ${TPath}`], TFetcher>;
};

type FormatPart<T extends string> = T extends `{${infer $Inner}}`
  ? `By${Capitalize<$Inner>}`
  : T extends `:${infer $Inner}`
  ? `By${Capitalize<$Inner>}`
  : Capitalize<T>;

type PathToId<T extends string> = T extends `/${infer $WithoutSlash}`
  ? PathToId<$WithoutSlash>
  : T extends `${infer $Part}/${infer $Rest}`
  ? `${FormatPart<$Part>}${PathToId<$Rest>}`
  : T extends string
  ? FormatPart<T>
  : "";

type FormatMethod<T extends string> = ({
  [key: string]: Lowercase<T>;
} & {
  POST: "create";
  PUT: "update";
})[T];

export type DeriveOperationName<TKey extends string> =
  TKey extends `${infer $Method} ${infer $Path}`
    ? `${FormatMethod<$Method>}${PathToId<$Path>}`
    : never;

export type UnclientOperations<
  TApi extends ApiDef = ApiDef,
  TFetcher extends Fetcher = Fetcher
> = {
  [Key in keyof TApi &
    string as DeriveOperationName<Key>]: TApi[Key] extends OperationConfig
    ? (
        ...params: FetcherParams<TApi[Key], InferFetcherOpts<TFetcher>>
      ) => ClientResponse<TApi[Key], TFetcher>
    : never;
};

export type Unclient<
  TApi extends ApiDef = ApiDef,
  TFetcher extends Fetcher = Fetcher
> = {
  $fetch: UnclientFetch<TApi, TFetcher>;
  $create: UnclientCreate<TApi, TFetcher>;
} & UnclientHttpMethods<TApi, TFetcher>;
