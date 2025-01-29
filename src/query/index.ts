import { ApiKey, Unclient } from "../client/types";
import { Fetcher, FetcherParams, FetcherReturn } from "../fetcher/types";
import { ApiDef, InferFetcherOpts, InferFetcherResponse } from "../infer/infer";
import {
  type MutationFunction,
  type QueryFunction,
} from "@tanstack/react-query";

export const init = <TApi extends ApiDef, TFetcher extends Fetcher>(
  client: Unclient<TApi, TFetcher>
): MakeReturn<TApi, TFetcher> => {
  return {
    query: (...args) => {
      return {
        queryKey: [...args],
        queryFn: async () => {
          const { data } = await client.$fetch(...args);

          return data;
        },
      };
    },
    mutation: (key) => {
      return {
        mutationKey: [key],
        mutationFn: async ([...rest]) => {
          const { data } = await client.$fetch(key, ...rest);
          return data;
        },
      };
    },
  };
};

export type MakeReturn<TApi extends ApiDef, TFetcher extends Fetcher> = {
  query: Query<TApi, TFetcher>;
  mutation: Mutation<TApi, TFetcher>;
};

export type Query<TApi extends ApiDef, TFetcher extends Fetcher> = <
  TKey extends ApiKey<TApi>
>(
  key: TKey,
  ...rest: FetcherParams<TApi[TKey], InferFetcherOpts<TFetcher>>
) => {
  queryKey: [TKey, ...typeof rest];
  queryFn: QueryFunction<
    FetcherReturn<TApi[TKey]["Output"], InferFetcherResponse<TFetcher>>["data"],
    [TKey, ...typeof rest],
    never
  >;
};

export type Mutation<TApi extends ApiDef, TFetcher extends Fetcher> = <
  TKey extends ApiKey<TApi>
>(
  key: TKey
) => {
  mutationKey: [TKey];
  mutationFn: MutationFunction<
    FetcherReturn<TApi[TKey]["Output"], InferFetcherResponse<TFetcher>>["data"],
    FetcherParams<TApi[TKey], InferFetcherOpts<TFetcher>>
  >;
};
