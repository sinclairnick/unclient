/** Simplify ({...} & {...}) types into a unified object */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

/** Make {unknown, undefined, null} optional */
export type FormatOptionals<T> = Simplify<
  {
    [Key in keyof T as T[Key] extends {} ? Key : never]: T[Key];
  } & {
    [Key in keyof T as T[Key] extends {} ? never : Key]?: T[Key];
  }
>;

/** An awaitable version of the response type */
export type Awaitable<T> = T | Promise<T>;

/** Default `undefined` to V */
export type Defaulted<T, V> = T extends undefined ? V : T;

/** Default `unknown` to V */
export type DefaultUnknownTo<T, D> = unknown extends T ? D : T;

/** Convert a union to an intersection */
export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

export type Strip<T, U = never> = {
  [Key in keyof T as [T[Key]] extends [U] ? never : Key]: T[Key];
} & {};

export type HttpVerb = "get" | "post" | "put" | "patch" | "delete";
export type HttpMethod = HttpVerb | Uppercase<HttpVerb>;
