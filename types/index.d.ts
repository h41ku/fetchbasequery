export type fetchInit = {
    logErrors: boolean | undefined,
    method: string | undefined,
    headers: object | undefined,
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
    signal: AbortSignal | undefined
};

export type queryFn = (options: fetchInit | any | undefined) => Promise<any>;
export type Middleware = (settings: any) => (query: queryFn) => queryFn;

export type fetchBaseQueryInit = {
    baseUrl: URL | string  | undefined,
    baseQuery: queryFn,
    middlewares: Array<Middleware>
};
