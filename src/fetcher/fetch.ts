import { createUrl } from "../util";
import { Fetcher } from "./types";

export const fetchFetcher = () => {
  return (async (config, options?: RequestInit) => {
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
