import { sleep } from '../utils/sleep.js'

/**
 * @typedef {import('./index.d.ts').RetryOn429Options} RetryOn429Options
 */

/**
 * @typedef {import('../index.d.ts').Middleware} Middleware
 */

/**
 * 
 * @param {RetryOn429Options} [options = {}]
 * @returns {Middleware}
 */
export function retryOn429({
    maxNumAttempts = 3,
    maxBackoffTime = Infinity,
    backoffTime = (attempt, response) => {
        const delayFromHeader = Number(response.headers.get('retry-after'))
        return isNaN(delayFromHeader) ? attempt * 2000 : delayFromHeader * 1000
    }
} = {}) {
    return async (request, next) => {
        let response
        for (let attempt = 1; attempt <= maxNumAttempts && !request.signal.aborted; attempt ++) {
            response = await next(request)
            if (response.status !== 429)
                break
            const delay = backoffTime(attempt, response)
            if (delay > maxBackoffTime)
                break
            await sleep(delay, request.signal)
        }
        return response || Response.error()
    }
}
