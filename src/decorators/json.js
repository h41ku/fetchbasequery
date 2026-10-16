/**
 * @typedef {import('../index.d.ts').FetchFunction<T>} FetchFunction
 * @template T
 */

/**
 * @typedef {import('./index.d.ts').JsonFetchFunction<T>} JsonFetchFunction
 * @template T
 */

/**
 * @typedef {import('./index.d.ts').PlainObject} PlainObject
 */

/**
 * @typedef {import('./index.d.ts').JsonRequestInit} JsonRequestInit
 */

/**
 * @typedef {import('../index.d.ts').AbortablePromise<T>} AbortablePromise
 * @template T
 */

/**
 * @typedef {import('./index.d.ts').JsonResponse<T>} JsonResponse
 * @template T
 */

/**
 * 
 * @param {BodyInit | PlainObject} value 
 * @returns {value is PlainObject}
 */
function isPlainObject(value) {
    return (
        typeof value === 'object'
        // && value !== null
        && !(value instanceof ArrayBuffer)
        && !(value instanceof FormData)
        && !(value instanceof Blob)
        && !(value instanceof ReadableStream)
        && !(value instanceof URLSearchParams)
    )
}

/**
 * 
 * @param {PlainObject} body 
 * @returns {string}
 */
function modifyBody(body) {
    return JSON.stringify(body, (key, value) => {
        if (value instanceof Error) {
            return value.stack.split(/\r?\n/g)
        } else if (typeof value === 'bigint') {
            return value.toString()
        }
        return value
    })
}

/**
 * 
 * @param {HeadersInit} headers 
 * @returns {Headers}
 */
function modifyHeaders(headers) {
    const result = new Headers(headers)
    if (!result.has('content-type'))
        result.set('content-type', 'application/json; charset=utf-8')
    return result
}

/**
 * 
 * @param {FetchFunction<Response>} query 
 * @returns {JsonFetchFunction<JsonResponse<T>>}
 * @template T
 */
export function json(query) {

    /**
     * @param {string | Request} resource
     * @param {JsonRequestInit} [options = {}]
     */
    return (resource, { body: initBody, headers: initHeaders, signal: initSignal, ...options } = {}) => {
        const abortController = new AbortController()
        const signal = AbortSignal.any([
            abortController.signal,
            ...(initSignal instanceof AbortSignal ? [ initSignal ] : [])
        ])
        /**
         * @type {AbortablePromise<JsonResponse<T>>}
         */
        const promise = (async () => {
            const isJson = isPlainObject(initBody)
            const body = isJson ? modifyBody(initBody) : initBody
            const headers = isJson ? modifyHeaders(initHeaders) : initHeaders
            const response = /** @type {JsonResponse<T>} */ (await query(resource, { body, headers, signal, ...options }))
            if (/^application\/json(\;| |$)/.test(String(response.headers.get('content-type'))))
                response.data = await (response.clone().json())
            return response
        })();
        promise.abort = (reason) => { abortController.abort(reason) }
        return promise
    }
}
