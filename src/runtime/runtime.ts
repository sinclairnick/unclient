import { OperationConfig, OperationMap } from "../infer/infer";
import { Infer, InferIn, Parser } from "schema-shift";

export type RuntimeApiDef = OperationMap<Parser>;

export type InferRuntimeApiDef<T extends RuntimeApiDef> = {
  [Key in keyof T]: T[Key] extends OperationConfig<Parser>
    ? {
        [Part in keyof T[Key]]: Part extends "Output"
          ? Infer<T[Key][Part]>
          : InferIn<T[Key][Part]>;
      } & {}
    : {
        Query?: unknown;
        Params?: unknown;
        Body?: unknown;
        Output: unknown;
      };
};

export const defineApi = <T extends RuntimeApiDef>(api: T) => {
  return api;
};
