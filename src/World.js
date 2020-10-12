import Database from './database/Database'
import DataHandler from './handlers/DataHandler'
import LoginHandler from './handlers/LoginHandler'
import Server from './server/Server'

import database from './config/database.json'
import worlds from './config/worlds.json'


class World extends Server {

    constructor(id, _handler = DataHandler) {
        let users = {}
        let db = new Database(database)
        let handler = new _handler(users)

        super(id, worlds[id], users, db, handler)
    }

}

new World('login', LoginHandler)
new World('blizzard')
