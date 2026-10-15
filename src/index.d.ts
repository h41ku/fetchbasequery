export type AbortablePromise<T> = Promise<T> & {
    abort: (reason?: string) => void
};

export type Middleware = (request: Request, next: (request: Request) => Promise<Response>) => Promise<Response>;

export type BaseFetchFunction = (resource: string | Request, options?: RequestInit) => Promise<Response>;
export type FetchBaseQueryOptions = RequestInit & {
    baseUrl?: string, // origin or prefix, used for URLs without it
    timeout?: number, // default timeout in milliseconds
    fetch?: BaseFetchFunction, // by default this is reference to `globalThis.fetch()`
    middlewares?: Middleware[] // list of middleware functions
};

export type FetchFunction<T> = (resource: string | Request, options?: RequestInit) => AbortablePromise<T>;

export declare function fetchBaseQuery<T>(options?: FetchBaseQueryOptions): FetchFunction<T>;

export default fetchBaseQuery
