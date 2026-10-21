/**
 * @param {number} delay Delay in milliseconds
 * @param {AbortSignal} [signal = undefined] 
 * @returns {Promise<void>}
 */
export function sleep(delay, signal = undefined) {
    return new Promise((resolve, reject) => { // abortable sleep
        const id = setTimeout(resolve, delay)
        if (signal instanceof AbortSignal) {
            const abortSignal = AbortSignal.any([ signal ])
            abortSignal.onabort = () => {
                clearInterval(id)
                reject(abortSignal.reason)
            }
        }
    })
}
