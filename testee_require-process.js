process.on('message', message => {if(message.end) process.kill(); if (message.start) {try {
 process.send({started: true})

 console.log = function() {process.send(JSON.stringify(Object.values(arguments)))}; 
const { log } = require('./src/helpers')

log(`starting! ${message.start}`)
} catch (error) {process.send(`process ${error}`)}}})