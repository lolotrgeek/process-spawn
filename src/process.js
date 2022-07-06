const fs = require('fs')
const { fork } = require('child_process')
const { table } = require('table')

const debug = false
let nodes = []
let boards = []

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

const col_config = {
    drawVerticalLine: (lineIndex, columnCount) => {
        return lineIndex === 0 || lineIndex === columnCount
      }    
}

function dashboard(message) {
    if (Array.isArray(message)) {
        let found = boards.findIndex(board => board[0][0][0] && board[0][0][0] === message[0][0][0])
        if (found > -1) boards[found] = message
        console.log(message)
        boards.push(message)
        let dash = boards.map(board => [table(board[0], col_config), table(board[1], col_config), table(board[2], col_config)])
        console.clear()
        console.log(table(dash))
    } else {
        console.log(message)
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