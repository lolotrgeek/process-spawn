
function dashboard(message) {
    try {
        let data = JSON.parse(message)
        console.log(...data)
    } catch (error) {
        console.log(message)
    }
}


module.exports = { dashboard }