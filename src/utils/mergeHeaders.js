/**
 * 
 * @param {HeadersInit} original
 * @param {HeadersInit} modifications
 * @returns {Headers}
 */
export function mergeHeaders(original, modifications) {
    const result = new Headers(original)
    const actualModifications = (modifications instanceof Headers ? modifications : new Headers(modifications))
    for (const pair of actualModifications)
        result.delete(pair[0])
    for (const pair of actualModifications)
        result.append(pair[0], pair[1])
    return result
}
