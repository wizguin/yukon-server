import fs from 'fs'
import path from 'path'


let files = fs.readdirSync(__dirname).filter(file => {
    return path.extname(file) == '.json'
})

const data: Record<string, any> = {}

for (let file of files) {
    data[file.replace('.json', '')] = require(`./${file}`)
}

export default data

export const { cards, decks, floorings, furnitures, igloos, items, matchmakers, pets, rooms, tables, waddles } = data
