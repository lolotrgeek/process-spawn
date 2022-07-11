process.on('message', message => {if(message.end) process.kill(); if (message.start) {try {
 process.send({started: true})

 console.log = function() {process.send(JSON.stringify(Object.values(arguments)))}; 

// this will log the message if `process.js` properly wraps this file
console.log("hell0!" , " world!", {some: 'message'})
// this will log true if `process.js` properly wraps this file
console.log("starting!", message.start)
} catch (error) {process.send(`process ${error}`)}}})