export default middleware => query => ({ signal, ...options } = {}) => {
    const abortController = new AbortController()
    const abortableQuery = (options) => query({
        ...options,
        signal: AbortSignal.any([
            abortController.signal,
            ...(signal ? [ signal ] : [])
        ])
    })
    const promise = middleware(abortableQuery)(options)
    promise.abort = () => abortController.abort()
    return promise
}
