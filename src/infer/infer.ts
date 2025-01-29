import { Fetcher } from "../fetcher/types";

export type OperationConfig<TValue = any> = {
  Query?: TValue;
  Params?: TValue;
  Body?: TValue;
  Output?: TValue;
};

export type OperationMap<TValue = any> = {
  [operation: `${string} ${string}`]: OperationConfig<TValue>;
};

export type ApiDef = OperationMap<any>;

export type DefineApi<T extends ApiDef> = T;

export type InferPaths<T extends ApiDef> =
  keyof T extends `${string} ${infer TPath}` ? TPath : never;

export type InferMethods<T extends ApiDef> =
  keyof T extends `${infer TMethod} ${string}` ? TMethod : never;

export type InferFetcherOpts<T extends Fetcher> = T extends Fetcher<
  infer TOpts,
  any
>
  ? TOpts
  : never;

export type InferFetcherResponse<T extends Fetcher> = T extends Fetcher<
  any,
  infer TResponse
>
  ? TResponse
  : never;
