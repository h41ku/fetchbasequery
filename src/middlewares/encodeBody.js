import purge from '../helpers/purge.js'
import encodeJson from '../helpers/encodeJson.js'
import responseFromError from '../helpers/responseFromError.js'

const moduleName = 'fetchBaseQuery/middlewares/accessToken'

const getEncodedBody = body => (
    typeof blob === 'string'
    || body instanceof String
    || body instanceof FormData
    || body instanceof Blob
    || body instanceof ArrayBuffer
    || body instanceof DataView
    || body instanceof File
    || body instanceof ReadableStream
    || body instanceof Int8Array
    || body instanceof Uint8Array
    || body instanceof Int16Array
    || body instanceof Uint16Array
    || body instanceof Int32Array
    || body instanceof Uint32Array
    || body instanceof BigInt64Array
    || body instanceof BigUint64Array
        ? body // raw
        : (
            body instanceof URLSearchParams
                ? body.toString()
                : encodeJson(body) // default
          )
)

const detectContentType = ({ body }) => {
    if (body instanceof ArrayBuffer
        || body instanceof DataView
        || body instanceof ReadableStream
        || body instanceof Int8Array
        || body instanceof Uint8Array
        || body instanceof Int16Array
        || body instanceof Uint16Array
        || body instanceof Int32Array
        || body instanceof Uint32Array
        || body instanceof BigInt64Array
        || body instanceof BigUint64Array
    ) return 'application/octet-stream'
    if (body instanceof URLSearchParams) return 'application/x-www-form-urlencoded'
    if (body instanceof FormData) return 'multipart/form-data'
    if (body instanceof Object) return 'application/json; charset=utf-8'
    // return undefined
}

export default (settings = {}) => (query) => async ({ body, headers, ...options } = {}) => {
    const {
        contentType,
        encodeBody
    } = {
        contentType: detectContentType,
        encodeBody: getEncodedBody,
        ...settings
    }
    let response
    try {
        response = await query({
            ...options,
            headers: purge({
                'Content-Type': contentType instanceof Function
                    ? contentType({ body })
                    : contentType,
                ...(headers || {})
            }),
            body: encodeBody(body)
        })
    } catch (error) {
        if (options.logErrors) {
            console.error(moduleName, error)
        }
        response = responseFromError(error)
    }
    if (options.debug?.encodeBody) {
        console.log(moduleName, response)
    }
    return response
}
