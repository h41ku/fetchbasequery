export default (error) => {
    const response = Response.error()
    response.error = error
    return response
}
