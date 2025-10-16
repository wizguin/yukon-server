const fs = require('fs')
const path = require('path')


let files = fs.readdirSync(__dirname).filter(file => {
    return path.extname(file) == '.json'
})

const data = {}

for (let file of files) {
    data[file.replace('.json', '')] = require(`./${file}`)
}

export default data
