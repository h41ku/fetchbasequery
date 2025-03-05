export default (a, b) => {
    const result = new Headers(a)
    b = (b instanceof Headers ? b : new Headers(b))
    for (let pair of b.entries())
        result.delete(pair[0])
    for (let pair of b.entries())
        result.append(pair[0], pair[1])
    return result
}
