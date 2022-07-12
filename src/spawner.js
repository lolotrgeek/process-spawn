const fs = require('fs')
const { fork } = require('child_process')
const { randomUUID } = require("crypto")
const { dashboard } = require('./dashboard')
const path = require("path")

// NOTE: may want to consider removing the `{killed: process.pid}` process.send if node is too chatty.
let beginning = "process.on('message', message => {\nif(message.end) {process.send('{killed: process.pid}');process.kill()}; \n if (message.start) {try {"
let start = "\n process.send({started: process.pid})\n"
let log = "\n console.log = function() {process.send(JSON.stringify(Object.values(arguments)))}; \n"
let end = "\n} catch (error) {process.send(`process ${error}`)}}})"

class Spawner {
    constructor() {
        this.debug = false
        this.nodes = []
    }
    set_node(file) {
        try {
            if (typeof file !== "string") throw ("file must be a string!")
            if (file.split('.').pop() !== 'js') throw ("file must be a .js file!")
            fs.accessSync(file)
            let tmp_file = `${path.parse(file).name}-${randomUUID()}.js`
            try {
                fs.accessSync(tmp_file)
            } catch (error) {
                // console.log("making...")
                let data = fs.readFileSync(file, 'utf8')
                // TODO: dynamic require pathing
                let middle = data.replace('require("..', 'require(".').replace("require('..", "require('.")
                let result = beginning + start + log + middle + end
                fs.writeFileSync(tmp_file, result, 'utf8')
                if (this.debug) fs.writeFileSync(`${path.parse(file).name}-debug.js`, result, 'utf8')
            }
            return { tmp_file }
        } catch (error) {
            throw (error)
        }

    }

    end_node(node) {
        try {
            node.send({ end: true })
        } catch (error) {
        }
    }

    handle_started(node) {
        node.started = true
        let found_node_index = this.nodes.findIndex(stored_node => stored_node.id === node.id)
        if (found_node_index) this.nodes[found_node_index] = node
        if (this.nodes.every(node => node.started === true)) fs.unlinkSync(node.spawnargs[1])
    }

    handle_message(message, node, listener) {
        if (typeof message === 'object' && message.started) this.handle_started(node)
        if (typeof message === 'object' && message.killed && this.debug === 'status') listener(message, node)
        else if (listener && node) listener(message, node)
        else dashboard(message)
    }

    handle_close(code, node) {
        let found_node_index = this.nodes.findIndex(stored_node => stored_node.id === node.id)
        if (found_node_index) this.nodes[found_node_index].killed = true
        console.log(`child ${node.id} node process exited with code ${code}`)
    }

    start_node({ tmp_file }, listener) {
        let node = fork(tmp_file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
        node.id = randomUUID()
        node.on('message', message => this.handle_message(message, node, listener))
        node.on("close", code => this.handle_close(code, node))
        node.send({ start: true })
        this.nodes.push(node)
    }

    /**
     * 
     * @param {string} file path to a `.js` file
     * @param {integer} number how many instances to spawn
     * @param {function} [listener] optional callback for handling messages `(message, node?)`
     */
    spawn_node(file, number, listener) {
        console.log(`Starting node ${this.nodes.length + 1}/${number}`)
        this.start_node(this.set_node(file), listener)
        if (this.nodes.length < number) setTimeout(() => this.spawn_node(file, number, listener), 500)
    }
}

module.exports = { Spawner }