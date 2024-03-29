const fs = require('fs')
const { fork } = require('child_process')
const { randomUUID } = require("crypto")
const { dashboard } = require('./dashboard')
const path = require("path")

// NOTE: may want to consider removing the `{killed: process.pid}` process.send if node is too chatty.
let beginning = "process.on('message', message => {\nif(message.end) {process.send({killed: process.pid});process.kill()}; \n if (message.start) {try {"
let start = "\n process.send({started: process.pid})\n"
let log = "\n console.log = function() {process.send(JSON.stringify(Object.values(arguments)))}; \n"
let end = "\n} catch (error) {process.send(`process ${error}`)}}})"

class Spawner {
    /**
     * Provides methods and parameters to spawn processes.
     * @param debug set logging level with the following: `spawn`, `status`, `exit`, `file`, `path`
     * @param complete set `true` to exit main process after all spawned processes have closed
     */
    constructor() {
        /**
         * @param debug set logging level with the following: `spawn`, `status`, `exit`, `file`, `path`
         */
        this.debug = false
        /**
         * @param complete set `true` to exit main process after all spawned processes have closed
         */
        this.complete = false
        this.nodes = []

        if (this.debug === 'path') {
            console.log("Source directory:", __dirname)
            console.log("Callee Directory", module.parent.path)
            console.log("Caller Directory", require.main.path)
        }

        process.stdin.resume();//so the program will not close instantly

        this.exitHandler = (options, exitCode) => {
            this.nodes.forEach(node => { try { fs.unlinkSync(node.spawnargs[1]) } catch { } })
            if (options.cleanup && this.debug === 'exit') console.log('clean')
            if (exitCode || exitCode === 0 && this.debug === 'exit') console.log(exitCode)
            if (options.exit) process.exit()
        }

        //do something when app is closing
        process.on('exit', this.exitHandler.bind(null, { cleanup: true }))

        //catches ctrl+c event
        process.on('SIGINT', this.exitHandler.bind(null, { exit: true }))

        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', this.exitHandler.bind(null, { exit: true }))
        process.on('SIGUSR2', this.exitHandler.bind(null, { exit: true }))

        //catches uncaught exceptions
        process.on('uncaughtException', this.exitHandler.bind(null, { exit: true }))

    }

    resolve_path(file) {
        if (!path.isAbsolute(file)) {
            if (file[0] === '.') file = file.substring(1)
            if (file[0] === '.' && file[1] === "/")file = file.substring(2)
            let resolved = require.main.path + "/" + file
            if(this.debug === 'path') console.log("resolved", resolved)
            if (path.isAbsolute(resolved)) return resolved
        }
        else return file
    }

    set_node(file) {
        try {
            if (typeof file !== "string") throw ("file must be a string!")
            if (file.split('.').pop() !== 'js') throw (`${file} file must be a .js file!`)
            file = this.resolve_path(file)
            fs.accessSync(file)
            let path_parsed = path.parse(file)
            let tmp_file = `${path_parsed.dir}/${path_parsed.name}-${randomUUID()}.js`
            try {
                fs.accessSync(tmp_file)
            } catch (error) {
                // console.log("making...")
                let data = fs.readFileSync(file, 'utf8')
                let result = beginning + start + log + data + end
                fs.writeFileSync(tmp_file, result, 'utf8')
                if (this.debug === 'file') fs.writeFileSync(`${path.parse(file).name}-debug.js`, result, 'utf8')
            }
            return { tmp_file, name: path_parsed.name }
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
        if (typeof message === 'object' && message.killed && this.debug === 'exit') console.log(message)
        else if (listener && node) listener(message, node)
        else dashboard(message)
    }

    handle_close(code, node) {
        if(this.debug === 'exit') console.log(`child ${node.id} node process exited with code ${code}`)
        if (this.complete && this.nodes.every(stored_node => stored_node.connected === false)) {
            if(this.debug === 'status') console.log("Completed")
            process.exit()
        }
    }

    start_node({ tmp_file, name }, listener) {
        let node = fork(tmp_file, { stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
        node.id = randomUUID()
        node.name = name
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
        if (this.debug === 'spawn') console.log(`Starting node ${this.nodes.length + 1}/${number}`)
        this.start_node(this.set_node(file), listener)
        if (this.nodes.length < number) setTimeout(() => this.spawn_node(file, number, listener), 500)
    }

    /**
     * 
     * @param {*} directory path of directory with files to spawn
     * @param {function} [listener] callback for handling messages 
     * @param {string | array} [ignore] name of file or array of files to ignore
     */
    spawn_directory(directory, listener, ignore) {
        try {
            directory = this.resolve_path(directory)
            let files = fs.readdirSync(directory)
            files.forEach((file, i) => {
                if (typeof ignore === 'string' && file === ignore) files.splice(i)
                if (Array.isArray(ignore)) ignore.forEach(file_to_ignore => { if (typeof file_to_ignore === 'string') files.splice(i) })
                this.spawn_node(directory+"/"+file, 1, listener)
            })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = { Spawner }