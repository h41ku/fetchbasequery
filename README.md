# fetchBaseQuery

Library for easily make HTTP queries without mass of boilerplate code.
It works fine in any environment that supports `Fetch API`.

## Features

- Lightweight modular typescript ready code
- Supports middleware programming pattern
- Using only modern API, has no any legacy code

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

### Basic usage

Use a factory function, which enhance a bare `fetch()`:

```js
import fetchBaseQuery from 'fetchbasequery'

const query = fetchBaseQuery({
    // main options ...
    baseUrl: 'https://api.example.org/v1',
    timeout: 10000, // in milliseconds
    fetch: globalThis.fetch, // it is possible to use a custom `fetch()` here
    // add some defaults for `fetch()` ...
    mode: 'cors',
    credentials: 'include',
    cache: 'reload',
    // ... see `RequestInit` for more options ...
})
```

Then use the returned function instead of bare `fetch()`:

```js
const resource = `/users/${id}` // full or short URL
const options = { // define some options, see `RequestInit`
    headers: { 'Authorization': '...' }
}
const response = await query(resource, options) // all options defined in `fetchBaseQuery()` will be passed into request
```

Function returns an abortable promise described using type `AbortablePromise<T>`.
So it is possible to abort the request at any time.

```js
const promise = query(...)
// ...
promise.abort('Component was unmounted...') // `reason` message is optional
```

Options of factory function described by type `FetchBaseQueryOptions`:

```ts
export type FetchBaseQueryOptions = RequestInit & {
    baseUrl?: string, // origin or prefix, used for URLs without it
    timeout?: number, // default timeout in milliseconds
    fetch?: BaseFetchFunction, // by default this is reference to `globalThis.fetch()`
    middlewares?: Middleware[] // list of middleware functions
};
```

### Using middlewares

```js
import fetchBaseQuery from 'fetchbasequery'
import { retryOnError } from 'fetchbasequery/middlewares'

const query = fetchBaseQuery({
    // ... options ...
    middlewares: [ // add some middlewares
        retryOnError({
            maxNumAttempts: 5
        }),
        // ...
    ]
})
```

### Using decorators

```js
import fetchBaseQuery from 'fetchbasequery'
import { json } from 'fetchbasequery/decorators'

const query = json(fetchBaseQuery({
    // ... options ...
}))

// Now `query()` accepts plain object as body and stringify it automatically.
// Also response has a `data` property, which contains parsed json returned by backend.
const { data } = await query('/articles', {
    method: 'post',
    body: { 
        title: '...',
        poster: '...',
        // ...
    }
})
```

### Writing a custom middleware

Middleware described by type `Middleware`:

```ts
export type Middleware = (request: Request, next: (request: Request) => Promise<Response>) => Promise<Response>;
```

Every middleware follows the simple pattern. Get `request`, do something with request,
then call `next(request)` to get `response`, do something with response and return it.

Let's create simple middleware for example:

```js
// Add to the request a CSRF-token as a custom header `X-CSRF-Token`
async function useCsrfToken(request, next) {
    const token = await getCsrfToken() // an abstract function just for example
    // modify the request
    const headers = new Headers(request.headers)
    headers.set('X-CSRF-Token', token)
    const modifiedRequest = new Request(request, { headers })
    // make a query using the modified request
    const response = await next(modifiedRequest)
    // it is possible to modify response too, but in this example we does not need it
    return response // just return the response as is
}
```

Usage:

```js
const query = fetchBaseQuery({
    baseUrl: 'https://...', // an abstract
    // ...
    middlewares: [
        // ...
        useCsrfToken,
        // ...
    ]
})
// ...
const formData = getFormData() // an abstract
// post the form to the protected route
const response = await query('/articles', {
    method: 'post',
    body: formData
})
```

### Writing a custom decorators

Decorators can extends logic and redefine types of request and response.

There are no restrictions for a decorator. It just a get original function and
return it's enhanced version. That's all.

Let's create a simple example:

```ts
import type { FetchFunction, AbortablePromise } from '../index.d.ts'
import fetchBaseQuery from '../index.js';

export type XmlResponse = Response & { document?: XMLDocument };

// Parses automatically XML documents provided by a raw response
export function withXmlParser(query: FetchFunction<Response>) {
    const supportedTypes = [
        'application/xml',
        'text/xml',
    ]
    return function (
        resource: string | Request,
        { signal: initSignal, ...options }: RequestInit = {}
    ): AbortablePromise<XmlResponse> {
        const abortController = new AbortController()
        const signal = AbortSignal.any([
            abortController.signal,
            ...(initSignal instanceof AbortSignal ? [ initSignal ] : [])
        ])
        const promise = (async () => {
            const response = (await query(resource, { signal, ...options })) as XmlResponse
            const contentType = String(response.headers.get('content-type')).split(';')[0]
            if (supportedTypes.includes(contentType)) { // if the response contains XML document
                // then parse content into special property `.document`
                const parser = new DOMParser()
                response.document = parser.parseFromString(await response.text(), 'application/xml')
            }
            return response
        })() as AbortablePromise<XmlResponse>;
        promise.abort = (reason) => { abortController.abort(reason) }
        return promise
    }
}
```

Usage:

```ts
const query = withXmlParser(fetchBaseQuery({
    baseUrl: 'https://...', // an abstract
    // ...
}))
const response = await query('/sitemap.xml')
console.log('Status:', response.status)
console.log('Content-Type:', response.headers.get('content-type'))
console.log('Document:', response.document)
```

## List of provided middlewares

### `muteErrors()`

Catch any error thrown by `next()` mute it and returns `Response.error()`.
Typically usage: use conditional statements instead of using `try-catch` statements.

### `retryOnError(options?: RetryOnErrorOptions)`

Retry to make a query when an error was thrown by `next()`.
Typically usage: repeat the request in case of a temporary loss of connection.

Options:

```ts
export type RetryOnErrorOptions = {
    maxNumAttempts?: number = 5, // the maximum number of attempts
    backoffTime?: (attempt: number) => number, // delay time in milliseconds
};
```

### `retryOn429(options?: RetryOn429Options)`

Retry to make a query when server returns status `429 Too Many Requests`.
Typically usage: repeat the request in case when servers busy or when rate limit was reached.

Options:

```ts
export type RetryOn429Options = {
    maxNumAttempts?: number = 5, // the maximum number of attempts
    maxBackoffTime?: number = Infinity, // the maximum permissible delay time
    backoffTime?: (attempt: number, response: Response) => number, // delay time in milliseconds
};
```

## List of provided decorators

### `json<T>(query: FetchFunction<Response>): JsonFetchFunction<JsonResponse<T>>`

Allows to pass a plain objects as `body` and automatically serialize plain objects into JSON.
It also automatically parse JSON documents provided by a raw response into special property `.data`.

Usage:
```ts
import fetchBaseQuery from 'fetchbasequery'
import { json } from 'fetchbasequery/decorators'

const query = json(fetchBaseQuery({
    // ...
}))
// ...
const response = await query('https://...', {
    method: 'put',
    body: { // decorator allows to pass a plain objects as body
        title: '...',
        // ...
    }
})
console.log('Status:', response.status)
console.log('Data:', response.data) // decorator also parses body returned as json
```

## Testing

Running tests:

```sh
npm run test
```

## TODO

- Chaining methods of `AbortablePromise<T>` (`.then()`, `.catch()` and `.finally()`)
  must returns instance of `AbortablePromise<T>` not pure `Promise<T>`;
- Add static methods to `AbortablePromise<T>` (`.all()`, `.any()`, `.race()`, etc);
- Describe and export utility function `sleep()` - abortable sleep function;
- Add, describe and export utility function `mergeHeaders()` to helps to write a middleware;

## References

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit)
- [429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429)

## License

MIT
