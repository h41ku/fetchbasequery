/**
 * @typedef {import('../index.d.ts').Middleware} Middleware
 */

/**
 * 
 * @returns {Middleware}
 */
export function muteErrors() {
    return async (request, next) => {
        try {
            return await next(request)
        } catch (e) {
            return Response.error()
        }
    }
}
