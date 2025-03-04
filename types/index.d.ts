export type DebuggingFlags = {
    baseQuery: boolean | undefined,
    encodeBody: boolean | undefined,
    accessToken: boolean | undefined,
    jsonReply: boolean | undefined,
    commonReply: boolean | undefined
};

export type FetchOptions = {
    logErrors: boolean | undefined,
    url: URL | string | undefined,
    request: Request | undefined,
    method: string | undefined,
    headers: Headers | object | undefined,
    body: string
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
        | URLSearchParams
        | undefined,
    mode: string | undefined,
    credentials: string | undefined,
    cache: string | undefined,
    redirect: string | undefined,
    referrer: string | undefined,
    referrerPolicy: string | undefined,
    integrity: string | undefined,
    keepalive: boolean | undefined,
    signal: AbortSignal | undefined,
    debug: DebuggingFlags | undefined
};

export type baseQueryFn = (options: FetchOptions | undefined) => Promise<Response>;
export type queryFn = (options: FetchOptions | undefined) => Promise<any>;
export type middlewareFn = (settings: any) => (query: queryFn) => queryFn;

export type FetchBaseQueryOptions = {
    baseUrl: URL | string  | undefined,
    baseQuery: baseQueryFn | undefined,
    middlewares: Array<middlewareFn>
};

export const baseQuery: baseQueryFn;

export const encodeBody: middlewareFn;
export const accessToken: middlewareFn;
export const jsonReply: middlewareFn;
export const commonReply: middlewareFn;

const fetchBaseQuery: (options: FetchBaseQueryOptions & FetchOptions) => queryFn;

export default fetchBaseQuery;
