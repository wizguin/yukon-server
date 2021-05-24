import Sequelize from 'sequelize'

import AuthTokens from './tables/AuthTokens'
import Buddies from './tables/Buddies'
import Floorings from './tables/Floorings'
import Furnitures from './tables/Furnitures'
import FurnitureInventories from './tables/FurnitureInventories'
import Igloos from './tables/Igloos'
import IglooInventories from './tables/IglooInventories'
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
        this.floorings = Floorings.init(this.sequelize, Sequelize)
        this.furnitures = Furnitures.init(this.sequelize, Sequelize)
        this.furnitureInventories = FurnitureInventories.init(this.sequelize, Sequelize)
        this.igloos = Igloos.init(this.sequelize, Sequelize)
        this.iglooInventories = IglooInventories.init(this.sequelize, Sequelize)
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
        let items = await this.getCrumb('items')
        items.slots = this.slots
        return items
    }

    async getIgloos() {
        return await this.getCrumb('igloos')
    }

    async getFurnitures() {
        return await this.getCrumb('furnitures')
    }

    async getFloorings() {
        return await this.getCrumb('floorings')
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

    async getIglooInventory(userId) {
        return await this.findAll('iglooInventories', {
            where: { userId: userId },
            attributes: ['iglooId']

        }, [], (result) => {
            return result.map(result => result.iglooId)
        })
    }

    async getFurnitureInventory(userId) {
        return await this.findAll('furnitureInventories', {
            where: { userId: userId },
            attributes: ['itemId', 'quantity'],
            raw: true

        }, {}, (result) => {
            return this.arrayToObject(result, 'itemId', 'quantity')
        })
    }

    async getIgloo(userId) {
        return await this.findOne('userIgloos', {
            where: { userId: userId },
            raw: true

        }, null, async (result) => {
            // Add furniture to igloo object
            result.furniture = await this.getUserFurnitures(userId)
            return result
        })
    }

    async getUserFurnitures(userId) {
        return await this.findAll('userFurnitures', {
            where: { userId: userId },
            raw: true

        }, [], (result) => {
            // Removes user id from all objects in furniture array
            return result.map(({ userId, ...furnitures}) => furnitures)
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

    async getCrumb(table) {
        return await this.findAll(table, {
            raw: true

        }, {}, (result) => {
            return this.arrayToObject(result, 'id')
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
