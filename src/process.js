const fs = require('fs')
const { fork } = require('child_process')
const { dashboard } = require('./dashboard')
const path = require("path")

const debug = false
let nodes = []

let beginning = "process.on('message', message => {if (message.start) {try {"
let log = "\n console.log = function() {process.send(JSON.stringify(Object.values(arguments)))}; \n"
let end = "\n} catch (error) {process.send(`process ${error}`)}}})"

function set_node(file) {
    try {
        if (typeof file !== "string") throw ("file must be a string!")
        if (file.split('.').pop() !== 'js') throw ("file must be a .js file!")
        fs.accessSync(file)
        let tmp_file = `${path.parse(file).name}-process.js`
        try {
            fs.accessSync(tmp_file)
        } catch (error) {
            // console.log("making...")
            let data = fs.readFileSync(file, 'utf8')
            let middle = log + data
            let result = beginning + middle + end
            fs.writeFileSync(tmp_file, result, 'utf8') 
        }
        return { tmp_file }
    } catch (error) {
        throw (error)
    }

}

function end_node(file) {
    try {
        fs.unlinkSync(`${path.parse(file).name}-process.js`)
    } catch (error) {
        throw(error)
    }
}

function start_node({ tmp_file }) {
    let node = fork(tmp_file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
    node.on('message', dashboard)
    node.on("close", code => console.log(`child node process exited with code ${code}`))
    node.send({ start: true })
    nodes.push(node)
}

/**
 * 
 * @param {string} file path to a `.js` file
 * @param {integer} number how many instances to spawn
 */
function spawn_node(file, number) {
    if (debug) console.log(`Starting node ${nodes.length + 1}/${number}`)
    start_node(set_node(file))
    if (nodes.length < number) setTimeout(() => spawn_node(file, number), 500)
    else setTimeout(() => end_node(file), 1000)
}


module.exports = { spawn_node }