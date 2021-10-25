// Converts a table to JSON and writes it to a file, useful for saving crumbs

import fs from 'fs'
import path from 'path'
import readline from 'readline'

import config from '../config/config.json'
import Database from '../src/database/Database'


const db = new Database(config.database)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function tableToJson(table, key, exclude) {
    if (!db[table]) {
        console.log('Table does not exist')
        return
    }

    db[table].findAll({
        raw: true,
        attributes: { exclude: exclude.split(',') }

    }).then((result) => {
        if (result) {
            removeNull(result)
            result = db.arrayToObject(result, key)
            saveJson(table, result)
        }
    })
}

function removeNull(result) {
    result.map(item => {
        Object.keys(item).forEach((k) => item[k] == null && delete item[k])
    })
}

function saveJson(table, result) {
    try {
        fs.writeFileSync(path.resolve(__dirname, `json/${table}.json`), JSON.stringify(result))
        console.log('Done')
    } catch (error) {
        console.log(error)
    }
}

function input(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer))
    })
}

(async () => {
    let table = await input('Enter table name: ')
    let key = await input('Enter table key: ')
    let exclude = await input('Enter fields to exclude (separated by commas): ')

    rl.close()
    tableToJson(table, key, exclude)
})()
