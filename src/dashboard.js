
const { table } = require('table')

let boards = []

const col_config = {
    drawVerticalLine: (lineIndex, columnCount) => {
        return lineIndex === 0 || lineIndex === columnCount
    }
}

function dashboard(message) {
    if (Array.isArray(message)) {
        let found = boards.findIndex(board => board[0][0][0] && board[0][0][0] === message[0][0][0])
        if (found > -1) boards[found] = message
        console.log(message)
        boards.push(message)
        let dash = boards.map(board => [table(board[0], col_config), table(board[1], col_config), table(board[2], col_config)])
        console.clear()
        console.log(table(dash))
    } else {
        console.log(message)
    }
}

module.exports = { dashboard }