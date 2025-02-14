export default object => Object.fromEntries(
    Object.entries(object)
        .filter(entry => entry[1] !== undefined)
)
