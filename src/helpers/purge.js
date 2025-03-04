const purgeObject = object => Object.fromEntries(
    Object.entries(object)
        .filter(entry => entry[1] !== undefined)
)

const purgeHeaders = headers => {
    headers.entities().forEach(([ name, value ]) => {
        if (value === '')
            headers.delete(name)
    })
    return headers
}

export default object => object instanceof Headers
    ? purgeHeaders(object)
    : purgeObject(object)
