import Sequelize from 'sequelize'

import Inventories from './tables/Inventories'
import Items from './tables/Items'
import Rooms from './tables/Rooms'
import Users from './tables/Users'


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

        this.inventories = Inventories.init(this.sequelize, Sequelize)
        this.items = Items.init(this.sequelize, Sequelize)
        this.rooms = Rooms.init(this.sequelize, Sequelize)
        this.users = Users.init(this.sequelize, Sequelize)

        this.sequelize
            .authenticate()
            .then(() => {
                // Connected
            })
            .catch(error => {
                console.error(`[Database] Unable to connect to the database: ${error}`)
            })
    }

    getItems() {
        return this.items.findAll({
            raw: true

        }).then((result) => {
            if (result) {
                result = this.arrayToObject(result, 'id')
                return result
            } else {
                return null
            }
        })
    }

    getRooms() {
        return this.rooms.findAll({
            raw: true

        }).then((result) => {
            if (result) {
                return result
            } else {
                return null
            }
        })
    }

    getUserByUsername(username) {
        return this.users.findOne({
            where: { username: username }

        }).then((result) => {
            if (result) {
                return result
            } else {
                return null
            }
        })
    }

    getInventory(userId) {
        return this.inventories.findAll({
            where: { userId: userId },
            attributes: ['itemId']

        }).then((result) => {
            if (result) {
                return result.map(result => result.itemId)
            } else {
                return []
            }
        })
    }

    arrayToObject(array, key) {
        return array.reduce((obj, item) => {
            obj[item[key]] = item
            delete item[key]

            return obj
        }, {})
    }

}
