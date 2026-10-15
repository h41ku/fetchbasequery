import { sleep } from '../utils/sleep.js'

/**
 * @typedef {import('./index.d.ts').RetryOnErrorOptions} RetryOnErrorOptions
 */

/**
 * @typedef {import('../index.d.ts').Middleware} Middleware
 */

/**
 * 
 * @param {RetryOnErrorOptions} [options = {}]
 * @returns {Middleware}
 */
export function retryOnError({
    maxNumAttempts = 3,
    backoffTime = attempt => attempt * 2000
} = {}) {
    return async (request, next) => {
        let lastError
        for (let attempt = 1; attempt <= maxNumAttempts && !request.signal.aborted; attempt ++) {
            try {
                return await next(request)
            } catch (e) {
                lastError = e
                await sleep(backoffTime(attempt), request.signal)
            }
        }
        throw lastError
    }
}
