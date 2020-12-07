import Database from './database/Database'
import DataHandler from './handlers/DataHandler'
import LoginHandler from './handlers/LoginHandler'
import Server from './server/Server'

import database from './config/database.json'
import worlds from './config/worlds.json'


class World extends Server {

    constructor(id) {
        let users = {}
        let db = new Database(database)

        let handler = (id == 'login') ? LoginHandler : DataHandler
        handler = new handler(users, db)

        super(id, worlds[id], users, db, handler)
    }

}

new World('login')
new World('blizzard')
