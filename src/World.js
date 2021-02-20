import Database from './database/Database'
import DataHandler from './handlers/DataHandler'
import LoginHandler from './handlers/LoginHandler'
import Server from './server/Server'

import config from './config/config.json'


class World extends Server {

    constructor(id) {
        let users = {}
        let db = new Database(config.database)

        let handler = (id == 'login') ? LoginHandler : DataHandler
        handler = new handler(users, db, config)

        super(id, users, db, handler, config)
    }

}

new World('login')
new World('blizzard')
