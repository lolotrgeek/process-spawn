const { Spawner} = require("../main")
const { dirname } = require('path')
let file = dirname(require.main.filename) +"/testee.js"
console.log(file)

new Spawner().spawn_node(file, 3)