export default (a, b) => {
    const result = new Headers(a)
    b = (b instanceof Headers ? b : new Headers(b))
    b.entries().forEach(pair => result.delete(pair[0]))
    b.entries().forEach(pair => result.append(pair[0], pair[1]))
    return result
}
