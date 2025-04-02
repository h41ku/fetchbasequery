// const pipeAsync = (...fns) => (input) => fns.reduce((chain, func) => chain.then(func), Promise.resolve(input))
import abortable from './helpers/abortable.js'
import pipe from './helpers/pipe.js'
import defaultBaseQuery from './baseQuery.js'

export default ({ baseQuery, middlewares, ...defaultOptions } = {}) => {
    const pipedQuery = pipe(...(middlewares || []).map(abortable))(baseQuery || defaultBaseQuery)
    return options => pipedQuery({
        ...defaultOptions,
        ...options
    })
}

export { defaultBaseQuery as baseQuery }
export * from './middlewares/index.js'
