const moduleName = 'fetchBaseQuery/middlewares/jsonReply'

export default (settings = {}) => query => async (options = {}) => {
    const {
        isJsonBody
    } = {
        isJsonBody: (response) => /^application\/json/i.test(response.headers.get('Content-Type')),
        ...settings
    }
    const response = await query(options)
    const { status, error, headers } = response
    let reply
    if (error) {
        reply = { status, error, headers }
    } else {
        let data
        try {
            if (isJsonBody(response)) {
                data = await response.json()
                reply = { status, data, headers }
            } else {
                reply = { status, headers }
            }
        } catch (error) {
            if (options.logErrors) {
                console.error(moduleName, error)
            }
            reply = { status, error, headers }
        }
    }
    if (options.debug?.jsonReply) {
        console.log(moduleName, reply)
    }
    return reply
}
