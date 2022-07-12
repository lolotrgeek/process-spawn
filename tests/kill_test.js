const { Spawner } = require("../main")

let file = "./files/testee.js"
console.log(file)
const spawner = new Spawner()
spawner.debug = 'status'
let number = 3
spawner.spawn_node(file, number, (message) => {
    if (spawner.nodes.every(node => node.killed === true)) return process.exit()
})


function killer() {
    if(spawner.nodes.length !== number) setTimeout(killer, 1000)
    else if (spawner.nodes.every(node => node.started === true)) {
        spawner.nodes.forEach(node => {
            if (node.killed === false) {
                console.log("ending:", node.pid)
                spawner.end_node(node)
            }
        })
        console.log(spawner.nodes.map(node => node.killed))
    } else setTimeout(killer, 1000)
}

killer()
