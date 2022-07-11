const { Spawner} = require("../main")

let file = "testee.js"
new Spawner().spawn_node(file, 1, message => console.log(message))