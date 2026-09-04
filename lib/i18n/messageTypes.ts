import { enMessages } from "./messages/en";

/** Recursively widen `as const` string literals to `string` for locale catalogs. */
export type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : never;

export type Messages = DeepStringify<typeof enMessages>;
