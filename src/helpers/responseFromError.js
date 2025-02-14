export default (error, status = 0) => ({
    status,
    error: typeof error === 'string'
        ? { message: error }
        : error,
    headers: new Headers()
})
