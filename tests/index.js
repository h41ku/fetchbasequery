import { fetchBaseQuery } from "../src/fetchBaseQuery.js"
import { muteErrors } from "../src/middlewares/muteErrors.js"
import { retryOnError } from "../src/middlewares/retryOnError.js"
import { retryOn429 } from "../src/middlewares/retryOn429.js"
import { json } from "../src/decorators/json.js"
import { sleep } from "../src/utils/sleep.js"

const createFakeFetch = () => {

    const session = {
        attempts: 0,
        counter: 1
    }

    const connectionError = () => { throw new Error('Failed to load resource: net::ERR_CONNECTION_TIMED_OUT') }

    /**
     * 
     * @param {string | Request} resource 
     * @param {RequestInit} [options = {}]
     * @returns {Promise<Response>}
     */
    return async (resource, options = {}) => {
        const request = new Request(resource, options)
        const url = new URL(request.url)
        if (url.origin !== 'https://test.local')
            connectionError()
        switch (url.pathname) {
            case '/counter': {
                switch (request.method.toLowerCase()) {
                    case 'get': {
                        return new Response(JSON.stringify({
                            success: true,
                            counter: session.counter
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                    case 'post': {
                        session.counter += 1
                        return new Response(JSON.stringify({
                            success: true,
                            counter: session.counter
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                    case 'put': {
                        const { delta } = await request.json()
                        session.counter += delta
                        return new Response(JSON.stringify({
                            success: true,
                            counter: session.counter
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                }
            } break
            case '/long-task': {
                switch (request.method.toLowerCase()) {
                    case 'post': {
                        await sleep(200)
                        return new Response(JSON.stringify({
                            success: true,
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                }
            } break
            case '/very-long-task': {
                switch (request.method.toLowerCase()) {
                    case 'post': {
                        await sleep(500, request.signal)
                        if (request.signal.aborted)
                            connectionError()
                        return new Response(JSON.stringify({
                            success: true,
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                }
            } break
            case '/too-many-requests': {
                switch (request.method.toLowerCase()) {
                    case 'get': {
                        const attempts = ++ session.attempts
                        if (attempts < 3) {
                            return new Response(null, {
                                status: 429,
                                statusText: 'Too Many Requests',
                                headers: {
                                    'Retry-After': '1'
                                }
                            })
                        }
                        return new Response(JSON.stringify({
                            success: true,
                            attempts
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                }
            } break
            case '/try-harder': {
                switch (request.method.toLowerCase()) {
                    case 'get': {
                        const attempts = ++ session.attempts
                        if (attempts < 3)
                            connectionError()
                        return new Response(JSON.stringify({
                            success: true,
                            attempts
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                }
            } break
            case '/echo-content-type': {
                switch (request.method.toLowerCase()) {
                    case 'post': {
                        return new Response(JSON.stringify({
                            success: true,
                            contentType: request.headers.get('content-type'),
                        }), {
                            status: 200,
                            statusText: 'OK',
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            }
                        })
                    }
                }
            } break
        }
        return new Response(null, {
            status: 404,
            statusText: 'Not Found'
        })
    }
}

async function test1() {
    const query = fetchBaseQuery({
        baseUrl: 'https://test.local',
        fetch: createFakeFetch()
    })
    {
        const response = await query('/counter')
        if (response.status !== 200)
            throw new Error('E01')
        const data = await response.json()
        if (data?.counter !== 1)
            throw new Error('E02')
    }
    {
        const response = await query('https://test.local/counter')
        if (response.status !== 200)
            throw new Error('E03')
        const data = await response.json()
        if (data?.counter !== 1)
            throw new Error('E04')
    }
    {
        try {
            const response = await query('https://test.global/counter')
            throw new Error('E05')
        } catch (e) {
        }
    }   
}

async function test2() {
    const query = fetchBaseQuery({
        baseUrl: 'https://test.local',
        fetch: createFakeFetch()
    })
    {
        const response = await query('/counter')
        if (response.status !== 200)
            throw new Error('E01')
        const data = await response.json()
        if (data?.counter !== 1)
            throw new Error('E02')
    }
    {
        const response = await query('/counter', { method: 'post' })
        if (response.status !== 200)
            throw new Error('E03')
        const data = await response.json()
        if (data?.counter !== 2)
            throw new Error('E04')
    }
    {
        const response = await query('/counter')
        if (response.status !== 200)
            throw new Error('E05')
        const data = await response.json()
        if (data?.counter !== 2)
            throw new Error('E06')
    }
    {
        const response = await query('/counter', { method: 'post' })
        if (response.status !== 200)
            throw new Error('E07')
        const data = await response.json()
        if (data?.counter !== 3)
            throw new Error('E08')
    }
}

async function test3() {
    const query = fetchBaseQuery({
        baseUrl: 'https://test.local',
        fetch: createFakeFetch(),
        middlewares: [
            muteErrors()
        ]
    })
    {
        const response = await query('https://test.global/counter')
        if (response.status !== 0)
            throw new Error('E01')
    }
    {
        const response = await query('/not-existed-path')
        if (response.status !== 404)
            throw new Error('E02')
    }
}

async function test4() {
    const query = fetchBaseQuery({
        baseUrl: 'https://test.local',
        fetch: createFakeFetch(),
    })
    {
        const response = await query('/echo-content-type', {
            method: 'post',
            body: new URLSearchParams({ 'foo': 'bar' })
        })
        if (response.status !== 200)
            throw new Error('E01')
        const data = await response.json()
        if (!/application\/x-www-form-urlencoded(\;| |$)/.test(data.contentType))
            throw new Error('E02')
    }
    {
        const body = new FormData()
        body.append('foo', 'bat')
        const response = await query('/echo-content-type', {
            method: 'post',
            body
        })
        if (response.status !== 200)
            throw new Error('E03')
        const data = await response.json()
        if (!/multipart\/form-data(\;| |$)/.test(data.contentType))
            throw new Error('E04')
    }
}

async function test5() {
    const query = fetchBaseQuery({
        baseUrl: 'https://test.local',
        timeout: 300,
        fetch: createFakeFetch(),
        middlewares: [
            muteErrors()
        ]
    })
    {
        const response = await query('/long-task', { method: 'post' })
        if (response.status !== 200)
            throw new Error('E01')
    }
    {
        const responsePromise = query('/very-long-task', { method: 'post' })
        setTimeout(() => { responsePromise.abort() }, 100)
        const response = await responsePromise
        if (response.status !== 0)
            throw new Error('E02')
    }
    {
        const response = await query('/very-long-task', { method: 'post' })
        if (response.status !== 0)
            throw new Error('E03')
    }
}

async function test6() {
    {
        const query = fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            middlewares: [
                retryOn429({
                    maxNumAttempts: 5
                })
            ]
        })
        const response = await query('/too-many-requests')
        if (response.status !== 200)
            throw new Error('E01')
        const data = await response.json()
        if (data.attempts !== 3)
            throw new Error('E02')
    }
    {
        const query = fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            middlewares: [
                retryOn429({
                    maxNumAttempts: 2
                })
            ]
        })
        const response = await query('/too-many-requests')
        if (response.status !== 429)
            throw new Error('E03')
    }
    {
        const query = fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            timeout: 300,
            middlewares: [
                muteErrors(),
                retryOn429({
                    maxNumAttempts: 5
                })
            ]
        })
        const response = await query('/too-many-requests')
        if (response.status !== 0)
            throw new Error('E04')
    }
}

async function test7() {
    {
        const query = fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            middlewares: [
                retryOnError({
                    maxNumAttempts: 5,
                    backoffTime: attempt => 200 + (attempt * 0)
                })
            ]
        })
        const response = await query('/try-harder')
        if (response.status !== 200)
            throw new Error('E01')
        const data = await response.json()
        if (data.attempts !== 3)
            throw new Error('E02')
    }
    {
        const query = fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            middlewares: [
                muteErrors(),
                retryOnError({
                    maxNumAttempts: 2,
                    backoffTime: attempt => 200 + (attempt * 0)
                })
            ]
        })
        const response = await query('/try-harder')
        if (response.status !== 0)
            throw new Error('E03')
    }
    {
        const query = fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            timeout: 300,
            middlewares: [
                muteErrors(),
                retryOnError({
                    maxNumAttempts: 5,
                    backoffTime: attempt => 200 + (attempt * 0)
                })
            ]
        })
        const response = await query('/try-harder')
        if (response.status !== 0)
            throw new Error('E04')
    }
}

async function test8() {
    {
        const query = json(fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
            middlewares: [
                retryOnError({
                    maxNumAttempts: 5,
                    backoffTime: attempt => 200 + (attempt * 0)
                })
            ]
        }))
        const response = await query('/try-harder')
        if (response.status !== 200)
            throw new Error('E01')
        const { data } = response
        if (data.attempts !== 3)
            throw new Error('E02')
    }
    {
        const query = json(fetchBaseQuery({
            baseUrl: 'https://test.local',
            fetch: createFakeFetch(),
        }))
        {
            const response = await query('/counter')
            if (response.status !== 200)
                throw new Error('E03')
            if (response.data?.counter !== 1)
                throw new Error('E04')
        }
        {
            const response = await query('/counter', { method: 'post' })
            if (response.status !== 200)
                throw new Error('E05')
            if (response.data?.counter !== 2)
                throw new Error('E06')
        }
        {
            const response = await query('/counter', { method: 'put', body: { delta: 3 } })
            if (response.status !== 200)
                throw new Error('E05')
            if (response.data?.counter !== 5)
                throw new Error('E06')
        }
        {
            const response = await query('/echo-content-type', {
                method: 'post',
                body: { 'foo': 'bar' }
            })
            if (response.status !== 200)
                throw new Error('E07')
            const { data } = response
            if (data.contentType !== 'application/json; charset=utf-8')
                throw new Error('E08')
        }
        {
            const response = await query('/echo-content-type', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: { 'foo': 'bar' }
            })
            if (response.status !== 200)
                throw new Error('E09')
            const { data } = response
            if (data.contentType !== 'application/json')
                throw new Error('E10')
        }
    }
}

async function test9() {
    const query = fetchBaseQuery({
        fetch: createFakeFetch(),
    })
    const promise = query('https://test.local/very-long-task', { method: 'post' })
    let error
    promise.catch(err => {
        error = err
    })
    const reason = 'Unmounting...'
    try {
        setTimeout(() => promise.abort(reason), 50)
        await promise
    } catch (e) {
        if (e !== reason)
            throw new Error('E01')
    } finally {
        if (error !== reason)
            throw new Error('E02')
    }
}

async function runTests() {
    const allTests = [
        test1,
        test2,
        test3,
        test4,
        test5,
        test6,
        test7,
        test8,
        test9,
    ]
    for (const test of allTests) {
        await test()
    }
}

console.log('Running tests, wait...')
runTests()
    .then(() => {
        console.log('All tests done.')
        globalThis?.process?.exit(0)
    })
    .catch(error => {
        console.error('Error while testing:', error)
        globalThis?.process?.exit(1)
    })
