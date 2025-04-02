import responseFromError from './helpers/responseFromError.js'
import purge from './helpers/purge.js'
import mergeHeaders from './helpers/mergeHeaders.js'

const moduleName = 'fetchBaseQuery/baseQuery'

const baseQuery = async ({ url: endpoint, request: subject, ...options } = {}) => {
    const {
        baseUrl,
        logErrors,
        debug,
        ...restOptions
    } = {
        logErrors: false,
        baseUrl: globalThis.location
            ? globalThis.location.origin
            : undefined,
        ...options
    }
    // extract options which are known by `fetch()`
    const { method, headers, body, mode, credentials, cache, redirect,
        referrer, referrerPolicy, integrity, keepalive, signal } = restOptions
    // combine extracted options and remove undefined properties
    const fetchOptions = purge({ method, headers, body, mode, credentials, cache, redirect,
        referrer, referrerPolicy, integrity, keepalive, signal })
    // do request
    let request
    let response
    try {
        if (endpoint !== undefined) {
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
            subject = url
        } else if (fetchOptions.headers) {
            fetchOptions.headers = mergeHeaders(subject.headers, fetchOptions.headers)
        }
        request = new Request(subject, fetchOptions)
        if (debug?.baseQuery) {
            console.log(moduleName, { request })
        }
        response = await fetch(request)
    } catch (error) {
        if (logErrors) {
            console.error(moduleName, error)
        }
        response = responseFromError(error)
    }
    if (debug?.baseQuery) {
        console.log(moduleName, { response })
    }
    return response
}

export default ({ timeout, signal, ...options } = {}) => {
    // construct abort signal
    const abortController = new AbortController()
    const abortSignal = AbortSignal.any([
        abortController.signal,
        ...(timeout ? [ AbortSignal.timeout(timeout) ] : []),
        ...(signal ? [ signal ] : [])
    ])
    // construct abortable promise
    const promise = baseQuery({ ...options, signal: abortSignal })
    promise.abort = () => abortController.abort()
    return promise
}
