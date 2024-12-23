export type ApiRoute = {
  Query?: any;
  Params?: any;
  Body?: any;
  Output?: any;
};

export type ApiDef = {
  [operation: `${string} ${string}`]: ApiRoute;
};

export type DefineApi<T extends ApiDef> = T;

export type InferPaths<T extends ApiDef> =
  keyof T extends `${string} ${infer TPath}` ? TPath : never;

export type InferMethods<T extends ApiDef> =
  keyof T extends `${infer TMethod} ${string}` ? TMethod : never;
