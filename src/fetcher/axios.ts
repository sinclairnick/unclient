import { createUrl } from "../util";
import { Fetcher } from "./types";
import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export type AxiosFetcherOpts = {
  axios?: AxiosInstance;
};

export const axiosFetcher = (opts?: AxiosFetcherOpts) => {
  const { axios = Axios } = opts ?? {};

  return (async (config, options?: AxiosRequestConfig) => {
    const { body, method } = config;
    const url = createUrl(config);

    const response = await axios({ method, url, data: body, ...options });

    return response;
  }) satisfies Fetcher;
};
