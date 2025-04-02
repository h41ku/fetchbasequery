export type DebuggingFlags = {
    baseQuery?: boolean,
    encodeBody?: boolean,
    accessToken?: boolean,
    jsonReply?: boolean,
    commonReply?: boolean
};

export type FetchOptions = {
    logErrors?: boolean,
    url?: URL | string,
    request?: Request,
    timeout?: number,
    method?: string,
    headers?: Headers | object,
    body?: string
        | object
        | FormData
        | Blob
        | ArrayBuffer
        | DataView
        | File
        | ReadableStream
        | Int8Array
        | Uint8Array
        | Int16Array
        | Uint16Array
        | Int32Array
        | Uint32Array
        | BigInt64Array
        | BigUint64Array
        | URLSearchParams,
    mode?: string,
    credentials?: string,
    cache?: string,
    redirect?: string,
    referrer?: string,
    referrerPolicy?: string,
    integrity?: string,
    keepalive?: boolean,
    signal?: AbortSignal,
    debug?: DebuggingFlags
};

export type baseQueryFn = (options?: FetchOptions) => Promise<Response>;
export type queryFn = (options?: FetchOptions) => Promise<any>;
export type middlewareFn = (settings: any) => (query: queryFn) => queryFn;

export type FetchBaseQueryOptions = {
    baseUrl?: URL | string,
    baseQuery?: baseQueryFn,
    middlewares?: Array<middlewareFn>
};

export const baseQuery: baseQueryFn;

export const encodeBody: middlewareFn;
export const accessToken: middlewareFn;
export const jsonReply: middlewareFn;
export const commonReply: middlewareFn;

declare function fetchBaseQuery(options?: FetchBaseQueryOptions & FetchOptions): queryFn;

export default fetchBaseQuery;
