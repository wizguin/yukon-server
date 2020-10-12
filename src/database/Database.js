import Sequelize from 'sequelize'

import Users from './tables/Users'
import Inventories from './tables/Inventories'


export default class Database {

    constructor(config) {
        this.sequelize = new Sequelize(
            config.database,
            config.user,
            config.password, {
                host: config.host,
                dialect: config.dialect,
                logging: (config.debug) ? console.log : false
        })

        this.users = Users.init(this.sequelize, Sequelize)
        this.inventories = Inventories.init(this.sequelize, Sequelize)

        this.sequelize
            .authenticate()
            .then(() => {
                // Connected
            })
            .catch(error => {
                console.error(`[Database] Unable to connect to the database: ${error}`)
            })
    }


    getUserByUsername(username) {
        return this.users.findOne({
            where: { username: username },
            attributes: { exclude: ['password'] }

        }).then(function(result) {
            if (result) {
                return result
            } else {
                return null
            }
        })
    }

    getInventory(userId) {
        return this.inventories.findAll({ where: { userId: userId }, attributes: ['itemId'] }).then(function(result) {
            if (result) {
                return result.map(result => result.itemId)
            } else {
                return []
            }
        })
    }

}
