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
    const { body, method, query, ...rest } = config;
    const url = createUrl(rest); // Passing the rest to axios directly

    const response = await axios({
      method,
      url,
      data: body,
      params: query,
      ...options,
    });

    return response;
  };
};
