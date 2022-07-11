const { Spawner} = require("./main")

new Spawner().spawn_node("./tests/testee.js", 1)
new Spawner().spawn_node("./tests/testee_require.js", 1)
new Spawner().spawn_node("./tests/testee.js", 1, message => console.log(message))