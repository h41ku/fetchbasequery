/**
 * @typedef {import('./index.d.ts').FetchBaseQueryOptions} FetchBaseQueryOptions
 */

/**
 * @typedef {import('./index.d.ts').AbortablePromise<T>} AbortablePromise<T>
 * @template T
 */

/**
 * @typedef {import('./index.d.ts').FetchFunction<T>} FetchFunction<T>
 * @template T
 */

/**
 * 
 * @param {import('./index.d.ts').FetchBaseQueryOptions} options 
 * @returns {FetchFunction<T>}
 * @template T
 */
export function fetchBaseQuery({
    baseUrl = '',
    timeout = Number.MAX_SAFE_INTEGER,
    fetch = globalThis.fetch,
    middlewares = [],
    ...baseOptions
} = {}) {

    const abortController = new AbortController()

    /**
     * 
     * @param {number} index 
     * @param {Request} request
     * @returns {Promise<Response>}
     */
    const runChain = (index, request) => {
        if (index === middlewares.length) {
            return fetch(request)
        }
        /**
         * @param {Request} request 
         * @returns {Promise<Response>}
         */
        const next = (request) => runChain(index + 1, request)
        return middlewares[index](request, next)
    }

    /**
     * 
     * @param {string} endpoint 
     * @returns {string}
     */
    const useBaseUrl = (endpoint) => {
        let url, origin, prefix = '/'
        if (baseUrl) {
            const url = new URL(baseUrl)
            origin = url.origin
            prefix = url.pathname
        }
        try {
            url = new URL(endpoint)
        } catch (error) {
            url = new URL(
                /\/$/.test(prefix) && /^\//.test(endpoint)
                    ? prefix + endpoint.substring(1)
                    : prefix + endpoint,
                origin
            )
        }
        return url.toString()
    }

    /**
     * 
     * @param {string | Request} resource 
     * @param {RequestInit} [options = {}]
     * @returns {AbortablePromise<T>}
     */
    return (resource, options = {}) => {
        const signalByTimeout = timeout !== Number.MAX_SAFE_INTEGER ? AbortSignal.timeout(timeout) : undefined
        const signalFromRequest = resource instanceof Request ? resource.signal : undefined
        const { signal: signalFromOptions, ...otherOptions } = options
        const target = resource instanceof Request ? resource : useBaseUrl(resource)
        const request = new Request(target, {
            ...baseOptions,
            signal: AbortSignal.any([
                abortController.signal,
                signalByTimeout,
                signalFromRequest,
                signalFromOptions
            ].filter(signal => signal instanceof AbortSignal)),
            ...otherOptions
        })
        const promise = /** @type {AbortablePromise<T>} */ (runChain(0, request))
        /**
         * @param {string} reason 
         */
        promise.abort = (reason) => { abortController.abort(reason) }
        return promise
    }
}
