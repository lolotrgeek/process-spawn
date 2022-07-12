const path = require('path')
let fullpath = path.dirname(require.main.filename) +"/files/testee.js"
let file_and_folder = "./files/testee.js"
let file_only = "./basic_test"
let folder_only = "files"

function resolve_path(file) {
    if (!path.isAbsolute(file)) {
        if (file[0] === '.') file.substring(1)
        if (file[0] === '.' && file[1] === "/") file.substring(2)
        let resolved = require.main.path + "/" + file
        if (path.isAbsolute(resolved)) return resolved
    }
    else return file
}

console.log("fullpath", resolve_path(fullpath))
console.log("fileandfolder", resolve_path(file_and_folder))
console.log("file_only", resolve_path(file_only))
console.log("folder_only", resolve_path(folder_only))


