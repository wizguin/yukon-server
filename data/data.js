import fs from 'fs'
import path from 'path'


let files = fs.readdirSync(__dirname).filter(file => {
    return path.extname(file) == '.json'
})

for (let file of files) {
    exports[file.replace('.json', '')] = require(`./${file}`)
}
