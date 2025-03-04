const moduleName = 'fetchBaseQuery/middlewares/commonReply'

export default () => query => async (options) => {
    const { status, data, error, headers } = await query(options)
    let reply
    if (error) {
        reply = { status, error: true, message: error.message || error, headers }
    } else if (data) {
        if (data.success) {
            reply = { ...data, status, headers }
        } else if (data.error) {
            reply = { status, error: true, message: data.message, headers }
        } else {
            reply = { status, error: true, message: 'Unexpected format of common response body.', headers }
        }
    } else {
        reply = { status, headers }
    }
    if (options.debug?.commonReply) {
        console.log(moduleName, { reply })
    }
    return reply
}
