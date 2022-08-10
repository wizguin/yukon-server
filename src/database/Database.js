import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'

const Op = Sequelize.Op


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

        // Used to translate type id to string
        this.slots = [ 'color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award' ]

        this.dir = `${__dirname}/models`
        this.loadModels()

        this.usernameRegex = /[^ -~]/i
        this.selectorRegex = /[^a-z0-9-]/i

        this.sequelize
            .authenticate()
            .then(() => {
                // Connected
            })
            .catch(error => {
                console.error(`[Database] Unable to connect to the database: ${error}`)
            })
    }

    loadModels() {
        fs.readdirSync(this.dir).forEach(model => {
            let modelImport = require(path.join(this.dir, model)).default
            let modelObject = modelImport.init(this.sequelize, Sequelize)

            let name = model.charAt(0).toLowerCase() + model.slice(1, -3)

            this[name] = modelObject
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

    async getTables() {
        return await this.findAll('tables', {
            raw: true
        })
    }

    async getWaddles() {
        return await this.findAll('waddles', {
            raw: true
        })
    }

    async getUserByUsername(username) {
        if (this.usernameRegex.test(username)) {
            return null
        }

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
        if (this.selectorRegex.test(selector)) {
            return null
        }

        return await this.findOne('authTokens', {
            where: { userId: userId, selector: selector }
        })
    }

    async getActiveBan(userId) {
        return await this.findOne('bans', {
            where: {
                userId: userId,
                expires: {
                    [Op.gt]: Date.now()
                }
            }
        })
    }

    async getBanCount(userId) {
        return await this.bans.count({
            where: { userId: userId }
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

    async getWorldPopulations() {
        return await this.getCrumb('worlds')
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
