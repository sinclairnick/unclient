import { createUrl } from "../util";
import { Fetcher } from "./types";

export const fetchFetcher = (): Fetcher<
  [options?: RequestInit],
  Response & { data: unknown }
> => {
  return (async (config, options) => {
    const { body, method } = config;
    const url = createUrl(config);

    const response = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return {
      ...response,
      data: response.clone().json(),
    };
  }) satisfies Fetcher;
};
