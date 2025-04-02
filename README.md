# fetchBaseQuery

Library for easily make HTTP queries without mass of boilerplate code.

## Installation

NPM:

```sh
npm install fetchbasequery
```

PNPM:

```sh
pnpm add fetchbasequery
```

## Usage

Build base query function:

```js
import fetchBaseQuery, { baseQuery, encodeBody, accessToken, jsonReply, commonReply } from 'fetchbasequery'

const query = fetchBaseQuery({
    // main options ...
    baseUrl: 'https://api.example.org/v1'
    baseQuery,
    timeout: 10000, // in milliseconds
    logErrors: true,
    // add some defaults for `fetch()` ...
    mode: 'cors',
    credentials: 'include',
    cache: 'reload',
    // middlewares
    middlewares: [
        encodeBody(),
        accessToken({
            getAccessToken: () => localStorage.getItem('access_token'),
            setAccessToken: (token) => localStorage.setItem('access_token', token),
            removeAccessToken: (token) => localStorage.removeItem('access_token'),
            getUpdatedAccessToken: async (response) => response.headers.get('X-Access-Token')
        }),
        jsonReply(),
        commonReply()
    ]
})
```

Now get easy to make queries:

```js
const response = await query({ url: '/users/me', timeout: 3000 }) // don't worry about catching errors
const { status, success, error } = response
if (success) {
    setUser(response.data)
} else if (error) {
    setError(response.message)
} else {
    setError(`Unexpected status code: ${status}`)
}
```

Using instance of `Request`:

```js
// for example inside ServiceWorker
addEventListener('fetch', evt => {
    const { request } = evt
    return evt.respondWith(query({ request }))
})
```

Aborting query:

```js
const promise = query({ url: '/users/me' })
promise.abort()
```

It works fine both on frontend and backend sides. For backend side usage Node.js v18+ is required,
because the middleware `baseQuery` based on `Fetch API`. But it can be replaced with your own
implementation based on another API (e.g. based on `axios` etc).

## License

MIT
