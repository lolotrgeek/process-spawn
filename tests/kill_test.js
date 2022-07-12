const { Spawner } = require("../main")

let file = "./files/testee.js"
console.log(file)
const spawner = new Spawner()
spawner.debug = 'status'
spawner.complete = true
let number = 3
spawner.spawn_node(file, number, message => { })


function killer() {
    console.log(spawner.nodes.map(node => node.connected))
    if (spawner.nodes.length === number && spawner.nodes.every(node => node.started === true)) {
        spawner.nodes.forEach(node => {
            if (node.connected === true) {
                console.log("ending:", node.pid)
                spawner.end_node(node)
            }
        })
    }
    else setTimeout(killer, 1000)

}

killer()
