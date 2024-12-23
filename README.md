## Unclient

Unclient is a tiny, minimalistic utility for interacting with HTTP APIs with type-safety, whether it's your API or not.

```sh
npm i unclient
```

## Features

- [x] Works with any HTTP API
- [x] Infer OpenAPI spec types without codegen
- [x] Implement custom fetchers
- [x] Unopinionated API
- [x] Implemented in simple JavaScript (i.e. no proxy objects)

## Example Usage

```ts
import { DefineApp } from "unclient";

// Define the endpoints (or generate from backend/OpenAPI)
type Api = DefineApi<{
  "GET /foo/:id": {
    Query: {
      foo: string;
    };
    Params: {
      id: string;
    };
  };
}>;

// Create an unclient
const client = createUnclient<Api>({
  fetcher: myFetcher,
});

const getFoo = client("GET /foo/:id");

const result = await getFoo({
  query: { foo: string },
  params: { id: "abc" },
});
```

## Table of Contents

- [Why?](#why)
- [How?](#how)
- [API Reference](#api-reference)
  - [`DefineApi`](#defineapit)
  - [`createUnclient`](#createunclientapidefopts)

## Why?

Typed API clients are a standard feature of any modern web, mobile or backend app. However, the API contract is often defined _implicitly_ throughout our codebase. Moreover, defining each type manually can be laborious, error prone and hard to track.

Unclient let's us define a single source of truth for our API contract. Further, we can export type definitions from our backend or generate them from OpenAPI specs. In turn, we can enjoy type safe clients without owning the API in question nor requiring buy-in to a full-stack backend framework.

## How?

By providing type description of a backend, whether defined on the client-side, backend or through OpenAPI specs, `unclient` reads this description and provides an ergonomic, tiny client. Since `unclient` is agnostic to _how_ exactly your fetches are made, it doesn't get in your way.

## API Reference

### `DefineApi<T>`

> A helper type for defining API endpoints.

With `DefineApi`, we provide a record of path and schema pairs. Each path may specify the following fields:

- `Query`: Query parameters
- `Params`: Path parameters
- `Body`: Request body
- `Output`: Response body

```ts
type MyApi = DefineApi<{
  "GET /post/:id": {
    Query: {
      limit: number;
    };
    Params: {
      id: string;
    };
    Body: {
      foo: string;
    };
    Output: {
      bar: string;
    };
  };
}>;
```

#### Using OpenAPI specs

We can automatically infer types from an OpenAPI JSON spec using the [`spec-dts`](https://github.com/sinclairnick/spec-dts?tab=readme-ov-file) package. The resulting API type definition is compatible with Unclient.

### `createUnclient<ApiDef>(opts)`

> Creates a new API client

To intialise a new client we must provide our API definition and a custom fetcher function.

The fetcher function receives a `config` parameter, which includes all of the necessary information for building a request. How that request is sent is intentionally up to you.

```ts
import { createUrl } from "unclient";

const client = createUnclient<MyApi>({
  fetcher: (config, ...rest) => {
    const { query, params, body, method, path } = config;

    // Use the `createUrl` utility to more easily derive the URL from `config`
    const url = createUrl(config);

    // ...turn the above into a `fetch`, `axios` etc. request config...

    return {
      data: {}, // Becomes the `Output` when invoking the client
    };
  },
});
```

#### Return Type

To capture the output type of the API response properly, while also enabling returning any additional information, the fetcher expects an object to be returned. The response body (if any) should be provided as a special `data` field, which will "inherit" the correct `Output` type, when the client is invoked.

```ts
const result = await getPosts(/** ... */);

const { data, ...rest } = result;

data;
// { bar: string }

rest;
// ...whatever else was returned
```

This opens the door to returning additional useful information like response headers or statusses (or anything else).

#### Custom parameters

The `...rest` params allow specifying arbitrary additional parameters to be passed to any client calls. For example, you might want to pass additional options to your fetching library of choice.

```ts
const client = createUnclient<MyApi>({
  fetcher: (config, options: RequestInit) => {
    // ...
    fetch(url, options);
    // ...
  },
});

// ...and when using the client

const result = getPosts(config, {
  headers: new Headers(),
});
```
