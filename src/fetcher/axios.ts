import { createUrl } from "../util";
import { Fetcher } from "./types";
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export type AxiosFetcherOpts = {
  axios?: AxiosInstance;
};

export const axiosFetcher = (
  opts?: AxiosFetcherOpts
): Fetcher<[options?: AxiosRequestConfig], AxiosResponse> => {
  const { axios = Axios } = opts ?? {};

  return async (config, options) => {
    const { body, method } = config;
    const url = createUrl(config);

    const response = await axios({ method, url, data: body, ...options });

    return response;
  };
};
