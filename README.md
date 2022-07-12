# Process Spawn
Start and monitor multiple instances of the same process.

## Usage
Spawn 5 nodes from a single file.
```
const {Spawner} = require('process-spawn')

const spawner = new Spawner()
spawner.spawn_node("yourfile.js", 5)
```

Spawn a node for each file in a directory 
```
const {Spawner} = require('process-spawn')

const spawner = new Spawner()
spawner.spawn_directory("./files", 5)
```

## Todo
- create a table for each node to dump it's log into