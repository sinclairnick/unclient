import { ApiKey, ClientResponse, Unclient } from "../client/types";
import { Fetcher, FetcherParams } from "../fetcher/types";
import { ApiDef, InferFetcherOpts } from "../infer/infer";
import {
  useMutation,
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
        queryFn: () => {
          return client.$fetch(...args);
        },
      };
    },
    mutation: (key) => {
      return {
        mutationKey: [key],
        mutationFn: async ([...rest]) => {
          return client.$fetch(key, ...rest);
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
    ClientResponse<TApi[TKey], TFetcher>,
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
    ClientResponse<TApi[TKey], TFetcher>,
    FetcherParams<TApi[TKey], InferFetcherOpts<TFetcher>>
  >;
};

useMutation({
  mutationFn: async (a: 1) => {
    return [];
  },
});
