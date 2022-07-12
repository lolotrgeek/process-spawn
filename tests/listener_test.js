const { Spawner} = require("../main")
new Spawner().spawn_node("files/testee.js", 1, message => console.log(message))