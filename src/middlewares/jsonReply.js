export default (settings = {}) => query => async (options = {}) => {
    const {
        isJsonBody
    } = {
        isJsonBody: (response) => /^application\/json/i.test(response.headers.get('Content-Type')),
        ...settings
    }
    const response = await query(options)
    const { status, error, headers } = response
    if (error) {
        return { status, error, headers }
    }
    let data
    try {
        if (isJsonBody(response) && response.json) {
            data = await response.json()
        }
    } catch (error) {
        if (options.logErrors) {
            console.error('fetchBaseQuery/middlewares/jsonReply', error)
        }
        return { status, error, headers }
    }
    return { status, data, headers }
}
