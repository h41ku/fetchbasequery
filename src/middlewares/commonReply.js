export default () => query => async (options) => {
    const { status, data, error, headers } = await query(options)
    if (error) {
        return { status, error: true, message: error.message, headers }
    } else if (data) {
        if (data.success) {
            return { ...data, status, headers }
        } else if (data.error) {
            return { status, error: true, message: data.message, headers }
        }
        return { status, error: true, message: 'Unexpected format of common response body.', headers }
    }
    return { status, headers }
}
