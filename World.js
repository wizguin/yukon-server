import Server from './src/server/Server'
import Database from './src/database/Database'
import DataHandler from './src/handlers/DataHandler'


class World extends Server {

    constructor() {
        let users = []
        let config = require('./config/config.json')
        let db = new Database(config.database)
        let handler = new DataHandler(users)

        super(config.world['1'], users, db, handler)
    }

}


new World()
