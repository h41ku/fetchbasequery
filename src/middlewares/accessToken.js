import responseFromError from '../helpers/responseFromError.js'
import purge from '../helpers/purge.js'

const moduleName = 'fetchBaseQuery/middlewares/accessToken'

export default (settings = {}) => query => async ({ payload, headers, ...options } = {}) => {
    const {
        getAccessToken,
        setAccessToken,
        removeAccessToken,
        isUnauthorized,
        getUpdatedAccessToken,
        getAuthorizationHeaders
    } = {
        getAccessToken: (payload) => undefined,
        setAccessToken: (token) => {},
        removeAccessToken: () => {},
        isUnauthorized: (response) => response.status === 401,
        getUpdatedAccessToken: async (response) => undefined,
        getAuthorizationHeaders: (accessToken) => (
            accessToken
                ? { Authorization: `bearer ${accessToken}` }
                : {}
        ),
        ...settings
    }
    let response
    try {
        response = await query({
            ...options,
            headers: purge({
                ...(getAuthorizationHeaders(getAccessToken(payload))),
                ...(headers || {})
            })
        })
    } catch (error) {
        if (options.logErrors) {
            console.error(moduleName, error)
        }
        response = responseFromError(error)
    }
    try {
        if (isUnauthorized(response)) {
            removeAccessToken()
        } else {
            const updatedAccessToken = await getUpdatedAccessToken(response)
            if (updatedAccessToken) {
                setAccessToken(updatedAccessToken)
            }
        }
    } catch (error) {
        if (options.logErrors) {
            console.error(moduleName, error)
        }
        response = responseFromError(error)
    }
    if (options.debug?.accessToken) {
        console.log(moduleName, { response })
    }
    return response
}
