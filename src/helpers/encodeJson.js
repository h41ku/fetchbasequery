export default body => JSON.stringify(body, (key, value) => {
    if (value instanceof Error) {
        return value.stack.split(/\r?\n/g)
    } else if (typeof value === 'bigint') {
        return value.toString()
    }
    return value
})
