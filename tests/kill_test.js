const { Spawner} = require("../main")
const { dirname } = require('path')
let file = dirname(require.main.filename) +"/testee.js"
console.log(file)
const spawner = new Spawner()
spawner.spawn_node(file, 3, (message, node) => {
    if (spawner.nodes.every(node => node.started === true)) setTimeout(() => {
        console.log("ending:", node.spawnargs[1])
        spawner.end_node(node)
        
    },1000)
    if(spawner.nodes.every(node => node.killed === true)) process.exit()
})