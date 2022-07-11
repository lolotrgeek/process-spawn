const { spawn_node } = require("../main")

let file = "testee.js"
spawn_node(file, 1, console.log)