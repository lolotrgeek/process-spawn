const debug = false
/**
 * Convert a function into a subprocess
 * @param {function} service the function to be converted
 */
function Child(service) {
    if (process.send && debug) process.send({ starting: service.name })
    process.on('message', message => {
        if (message.start) {
            try {
                service()
            } catch (error) {
                process.send(`process ${error}`)
                // process.exit()
            }
        }
    })
}

module.exports = { Child }