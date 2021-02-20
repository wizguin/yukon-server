// Generates a new JWT secret and stores it in config.json
// Servers must be restarted for the new key to take effect

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const file = path.resolve(__dirname, '../config/config.json')
const config = require(file)


try {
    let secret = crypto.randomBytes(32).toString('hex')
    config.crypto.secret = secret

    fs.writeFileSync(file, JSON.stringify(config, null, 4) + '\n')
    console.log('Secret updated')

} catch (err) {
    console.error(err)
}
