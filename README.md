## Unclient

Unclient is a simple HTTP client wrapper with an emphasis on strong type-safety, flexibilty and ergonomics. It aims to minimise boilerplate while keeping out of your way.

```sh
npm i unclient
```

## Features

- [x] Works with any HTTP API
- [x] Flexible fetching mechanism
- [x] Unopinionated
- [x] Implemented in simple JavaScript (i.e. no proxy objects)

## Example Usage

```ts
import { DefineApp } from "unclient";

// Define operations
type Api = DefineApi<{
  "GET /foo/:id": {
    Query: {
      foo: string;
    };
    Params: {
      id: string;
    };
    Output: {
      bar: string;
    };
  };
}>;

const client = createUnclient<Api>()({
  fetcher: myFetcher,
});

const {
  data: { bar },
} = await client.$fetch("GET /foo/:id", {
  query: { foo: string },
  params: { id: "abc" },
});

// or: const getFoo = client.$create("GET /foo/:id")
```

## Table of Contents

- [Why?](#why)
- [How?](#how)
- [API Reference](#api-reference)
  - [`DefineApi`](#defineapit)
  - [`createUnclient`](#createunclientapidefopts)

## Why?

Using strongly typed API clients has become a fairly common practice in modern development. However, most of the time, some sort of code generation is required, or the client is tightly coupled to some backend framework, or the fetching mechanism is overly opinionated or inflexible.

Unlike these approaches, `unclient` requires no code generation, nor is it coupled to any backend framework. Additionally, fetching can be completely customised to use your desired HTTP client library (or none). This enables constructing typed clients for any HTTP backend, whether it's our own or someone elses.

## Guide

### Defining an API

Unclient relies on an API definition and a fetcher.

```ts
const client = createUnclient<Api>()({
  fetcher,
});
```

The API definition is essentially a list of HTTP operations like `GET /foo`, and a record of the various inputs for that endpoint. The input parts include:

- `Params`: Path params
- `Query`: Query params
- `Body`: Request body
- `Output`: Response body

#### Type Definition

Our API can be defined solely in at the type level:

```ts
type Api = DefineApi<{
  "GET /post/:id": {
    // ...
  };
}>;

const client = createUnclient<Api>()(opts);
```

#### Runtime Definition

If we want our data to be validated on the client side, we can define our APIs like so:

```ts
const api = defineApi(
  "GET /post/:id": z.object({
    // ...
  })
  // or: typebox, valibot, etc.
)

const client = createUnclient(api)(opts);
```

In this case, our input and output data will be validated and transformed at runtime.

### Providing a Fetcher

By default, our client has no idea how to communicate with your API of interest. That behaviour is defined in the `fetcher`.

```ts
const client = createUnclient<Api>()({
  fetcher: (config) => {
    const { path, method, query, params, body } = config;

    // ...call the API

    return { data: { foo: "bar" } };
  },
});
```

The fetcher is called for each invocation of our client to a given endpoint, with specific input data, like the request body or query params. The first argument represents this information. It's up to the fetcher to decide how that information translates into an actual request, to send the request and to return any response data.

For convenience sake, `unclient` offers several fetchers out of the box. However, these are not required nor doing anything complicated. They are simply provided to further simplify setup.

```ts
import { axiosFetcher } from "unclient/axios";
// or: import { fetchFetcher } from "unclient/fetch";

const instance = axios.create({
  baseUrl: "/api/v1",
});

const client = createUnclient<Api>()({
  fetcher: axiosFetcher({ axios: instance }),
});
```

### Return Types

Aside from when throwing errors, the fetcher should always return an object with a `data` field. This will be correctly typed come time to invoke our client.

```ts
const client = createUnclient<Api>()({
  fetcher: (config) => {
    // ...call the API

    return { data };
  },
});
```

This quirk enables us to return whatever additional information we want, retaining the type safety of both the API result and the additional information.

```ts
const client = createUnclient<Api>()({
  fetcher: (config) => {
    // ...call the API

    return {
      data, // will still be typed correctly

      // And so will these...
      headers,
      status,
    };
  },
});
```

### Additional Parameters

Similarly, we can provide custom, additional parameters to our fetcher, which will be exposed when invoking our client. They can be made required or optional.

```ts
const client = createUnclient<Api>()({
  fetcher: (
    config,
    // Additional params:
    requiredOption: number,
    optionalOption?: string
  ) => {
    //...
  },
});
```

### Invoking the Client

We can invoke our client in several ways, in order to initiate an HTTP request.

#### `client.$fetch`

The simplest way to make HTTP requests is to use the `$fetch` method. It accepts at least two arguments: the operation key and any input data.

```ts
const result = await client.$fetch(
  "GET /foo",
  {
    query: ...,
    // ...
  },

  // + any additional fetcher options you've defined
);

const {
   data, // Will have type of `Output`, if specified
   ..extra // will have type of remaining fetcher return
 } = result
```

#### `client.$create`

In certain instances we might want to reference a specific operation, avoiding the need to specify the operation key each time.

We can reference and invoke specific operations by creating functions via the `$create` method.

```ts
const getFoo = client.$create("GET /foo");

const result = await getFoo(inputs, ...additionalParams);
```

#### `client.$<verb>`

Unclient also exposes familiar HTTP-verb-specific methods to make invocation more concise.

```ts
const result = await client.$get("/foo", inputs);
```

> While the API definition supports any HTTP verb, only 'get', 'post', 'patch', 'put' and 'delete' are exposed as $methods.

### OpenAPI

In conjunction with [`spec-dts`](https://github.com/sinclairnick/spec-dts), we can create OpenAPI clients without the need for any codegen.

The `unclient` API shape is entirely compatible with that produced by `spec-dts`. View the `spec-dts` instructions for more info.
