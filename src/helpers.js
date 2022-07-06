const log = message => process.send ? process.send(message) : console.log(message)

function decode(data) {
    try {
        return JSON.parse(data)
    } catch (error) {
        return data
    }
}

const encode = data => JSON.stringify(data)

module.exports = { log, decode, encode }