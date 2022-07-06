const fs = require('fs')
const { fork } = require('child_process')
const { dashboard } = require('./dashboard')

const debug = false
let nodes = []

function set_node(path) {
    try {
        if(typeof path !== 'string') throw "path must be a string!"
        if(path.split('.').pop() !== 'js') throw "path must be a .js file!"
        fs.accessSync(path)
        return { file }
    } catch (error) {
        throw(error)
    }
    
}

function start_node({ file }) {
    let node = fork(file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    node.on('message', dashboard)
    node.on("close", code => console.log(`child node process exited with code ${code}`))
    node.send({ start: true })
    nodes.push(node)
}

/**
 * 
 * @param {string} path to a `.js` file
 * @param {integer} number how many instances to spawn
 */
function spawn_node(path, number) {
    if (debug) console.log(`Starting node ${nodes.length + 1}/${number}`)
    start_node(set_node(path))
    if (nodes.length < number) setTimeout(() => spawn_node(number), 500)

}

module.exports = { spawn_node }