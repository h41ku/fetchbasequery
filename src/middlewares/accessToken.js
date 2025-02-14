import responseFromError from '../helpers/responseFromError.js'
import purge from '../helpers/purge.js'

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
        getUpdatedAccessToken: (response) => undefined,
        ...settings
    }
    let response
    let status = 0
    try {
        const accessToken = getAccessToken(payload)
        response = await query({
            ...options,
            headers: purge({
                ...(accessToken ? { Authorization: `bearer ${accessToken}` } : {}),
                ...(headers || {})
            })
        })
        status = response.status
        if (isUnauthorized(response)) {
            setAccessToken(null) // special case to remove access token from storage
        } else {
            const updatedAccessToken = getUpdatedAccessToken(response)
            if (updatedAccessToken) {
                setAccessToken(updatedAccessToken)
            }
        }
    } catch (error) {
        if (options.logErrors) {
            console.error('fetchBaseQuery/middlewares/accessToken', error)
        }
        return responseFromError(error, status)
    }
    return response
}
