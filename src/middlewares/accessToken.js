import responseFromError from '../helpers/responseFromError.js'
import purge from '../helpers/purge.js'

const moduleName = 'fetchBaseQuery/middlewares/accessToken'

export default (settings = {}) => query => async ({ payload, headers, ...options } = {}) => {
    const {
        getAccessToken,
        setAccessToken,
        isUnauthorized,
        getUpdatedAccessToken
    } = {
        getAccessToken: (payload) => undefined,
        setAccessToken: (token) => {},
        isUnauthorized: (response) => response.status === 401,
        getUpdatedAccessToken: async (response) => undefined,
        ...settings
    }
    let response
    try {
        const accessToken = getAccessToken(payload)
        response = await query({
            ...options,
            headers: purge({
                ...(accessToken ? { Authorization: `bearer ${accessToken}` } : {}),
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
            setAccessToken(null) // special case to remove access token from storage
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
        console.log(moduleName, response)
    }
    return response
}
