import type { AbortablePromise, FetchFunction } from "../index.d.ts";

type Override<T, U> = Omit<T, keyof U> & U;

export type PlainObject = Record<string, any>;
export type JsonRequestInit = Override<RequestInit, { body?: BodyInit | PlainObject }>;
export type JsonResponse<T> = Response & { data?: T };
export type JsonFetchFunction<T> = (resource: string | Request, options?: JsonRequestInit) => AbortablePromise<T>;

export declare function json<T>(query: FetchFunction<Response>): JsonFetchFunction<JsonResponse<T>>;
