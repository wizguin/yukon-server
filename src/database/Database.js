import Sequelize from 'sequelize'

import AuthTokens from './tables/AuthTokens'
import Buddies from './tables/Buddies'
import Furnitures from './tables/Furnitures'
import FurnitureInventories from './tables/FurnitureInventories'
import Ignores from './tables/Ignores'
import Inventories from './tables/Inventories'
import Items from './tables/Items'
import Rooms from './tables/Rooms'
import Users from './tables/Users'
import UserFurnitures from './tables/UserFurnitures'
import UserIgloos from './tables/UserIgloos'


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

        this.authTokens = AuthTokens.init(this.sequelize, Sequelize)
        this.buddies = Buddies.init(this.sequelize, Sequelize)
        this.furnitures = Furnitures.init(this.sequelize, Sequelize)
        this.furnitureInventories = FurnitureInventories.init(this.sequelize, Sequelize)
        this.ignores = Ignores.init(this.sequelize, Sequelize)
        this.inventories = Inventories.init(this.sequelize, Sequelize)
        this.items = Items.init(this.sequelize, Sequelize)
        this.rooms = Rooms.init(this.sequelize, Sequelize)
        this.users = Users.init(this.sequelize, Sequelize)
        this.userFurnitures = UserFurnitures.init(this.sequelize, Sequelize)
        this.userIgloos = UserIgloos.init(this.sequelize, Sequelize)

        // Used to translate type id to string
        this.slots = [ 'color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award' ]

        this.sequelize
            .authenticate()
            .then(() => {
                // Connected
            })
            .catch(error => {
                console.error(`[Database] Unable to connect to the database: ${error}`)
            })
    }

    async getItems() {
        return await this.findAll('items', {
            raw: true

        }, {}, (result) => {
            result = this.arrayToObject(result, 'id')
            result.slots = this.slots
            return result
        })
    }

    async getFurnitures() {
        return await this.findAll('furnitures', {
            raw: true

        }, {}, (result) => {
            return this.arrayToObject(result, 'id')
        })
    }

    async getRooms() {
        return await this.findAll('rooms', {
            raw: true
        })
    }

    async getUserByUsername(username) {
        return await this.findOne('users', {
            where: { username: username }
        })
    }

    async getUserById(userId) {
        return await this.findOne('users', {
            where: { id: userId }
        })
    }

    async getAuthToken(userId, selector) {
        return await this.findOne('authTokens', {
            where: { userId: userId, selector: selector }
        })
    }

    async getBuddies(userId) {
        return await this.findAll('buddies', {
            where: { userId: userId },
            attributes: ['buddyId']

        }, [], (result) => {
            return result.map(result => result.buddyId)
        })
    }

    async getIgnores(userId) {
        return await this.findAll('ignores', {
            where: { userId: userId },
            attributes: ['ignoreId']

        }, [], (result) => {
            return result.map(result => result.ignoreId)
        })
    }

    async getInventory(userId) {
        return await this.findAll('inventories', {
            where: { userId: userId },
            attributes: ['itemId']

        }, [], (result) => {
            return result.map(result => result.itemId)
        })
    }

    async getFurnitureInventory(userId) {
        return await this.findAll('furnitureInventories', {
            where: { userId: userId },
            attributes: ['itemId', 'quantity'],
            raw: true

        }, [], (result) => {
            return this.arrayToObject(result, 'itemId', 'quantity')
        })
    }

    async getIgloo(userId) {
        return await this.findOne('userIgloos', {
            where: { userId: userId },
            raw: true

        }, null, async (result) => {
            // Add furniture to igloo object
            result.furniture = await this.getUserFurnitures(result.id)
            return result
        })
    }

    async getUserFurnitures(iglooId) {
        return await this.findAll('userFurnitures', {
            where: { iglooId: iglooId },
            raw: true

        }, [], (result) => {
            // Removes igloo id from all objects in furniture array
            return result.map(({ iglooId, ...furnitures}) => furnitures)
        })
    }

    /*========== Helper functions ==========*/

    findOne(table, options = {}, emptyReturn = null, callback = null) {
        return this.find('findOne', table, options, emptyReturn, callback)
    }

    findAll(table, options = {}, emptyReturn = null, callback = null) {
        return this.find('findAll', table, options, emptyReturn, callback)
    }

    find(find, table, options, emptyReturn, callback) {
        return this[table][find](options).then((result) => {

            if (callback && result) {
                return callback(result)
            } else if (result) {
                return result
            } else {
                return emptyReturn
            }
        })
    }

    arrayToObject(array, key, value = null) {
        return array.reduce((obj, item) => {
            // If a value is passed in then the key will be mapped to item[value]
            let result = (value) ? item[value] : item

            obj[item[key]] = result
            delete item[key]

            return obj
        }, {})
    }

}
