export default (...fns) => (input) => fns.reduce((chain, f) => f(chain), input)
