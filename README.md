# fetchBaseQuery

Library for easily make HTTP queries without mass of boilerplate code.

Usage
-----

Build base query function:

```js
import fetchBaseQuery, { baseQuery, encodeBody, accessToken, jsonReply, commonReply } from 'fetchbasequery'

const query = fetchBaseQuery({
    baseUrl: 'https://api.example.org/v1'
    baseQuery,
    logErrors: true,
    middleware: [
        encodeBody(),
        accessToken({
            getAccessToken: () => localStorage.getItem('access_token'),
            setAccessToken: (token) => localStorage.setItem('access_token', token),
            getUpdatedAccessToken: (response) => response.headers.get('X-Access-Token')
        }),
        jsonReply(),
        commonReply()
    ]
})
```

Now get easy to make queries:

```js
const response = await query({ url: '/users/me' }) // don't worry about catching errors
const { status, success, error } = response
if (success) {
    setUser(response.data)
} else if (error) {
    setError(response.message)
} else {
    setError(`Unexpected status code: ${status}`)
}
```

It works fine both on frontend and backend sides. For backend side usage Node.js v18+ is required,
because the middleware `baseQuery` based on `Fetch API`. But it can be replaced with your own
implementation based on another API (e.g. based on `axios` etc).
