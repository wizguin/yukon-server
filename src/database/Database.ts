import type { Config } from '../config/config'

import type AuthTokens from './models/AuthTokens'
import type Bans from './models/Bans'
import type Buddies from './models/Buddies'
import type Cards from './models/Cards'
import type FurnitureInventories from './models/FurnitureInventories'
import type Furnitures from './models/Furnitures'
import type IglooInventories from './models/IglooInventories'
import type Igloos from './models/Igloos'
import type Ignores from './models/Ignores'
import type Inventories from './models/Inventories'
import type Pets from './models/Pets'
import type Postcards from './models/Postcards'
import type Users from './models/Users'
import type Worlds from './models/Worlds'

import type { FindOptions } from 'sequelize'
import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'

type FindCallback = ((result: any) => any) | null

export default class Database {

    sequelize: Sequelize
    slots: string[]
    dir: string

    usernameRegex: RegExp
    selectorRegex: RegExp

    authTokens!: typeof AuthTokens
    bans!: typeof Bans
    buddies!: typeof Buddies
    cards!: typeof Cards
    furnitureInventories!: typeof FurnitureInventories
    furnitures!: typeof Furnitures
    iglooInventories!: typeof IglooInventories
    igloos!: typeof Igloos
    ignores!: typeof Ignores
    inventories!: typeof Inventories
    pets!: typeof Pets
    postcards!: typeof Postcards
    users!: typeof Users
    worlds!: typeof Worlds

    constructor(config: Config['database']) {
        this.sequelize = new Sequelize(
            config.database,
            config.user,
            config.password,
            {
                host: config.host,
                dialect: config.dialect,
                logging: config.debug ? console.log : false,
                logQueryParameters: config.logQueryParameters
            }
        )

        // Used to translate type id to string
        this.slots = ['color', 'head', 'face', 'neck', 'body', 'hand', 'feet', 'flag', 'photo', 'award']

        this.dir = `${__dirname}/models`

        const models = this.loadModels()
        this.loadAssociations(models)

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
        const models: any[] = []

        fs.readdirSync(this.dir).forEach(model => {
            const modelImport = require(path.join(this.dir, model)).default
            const modelObject = modelImport.initModel(this.sequelize, Sequelize)

            const name = model.charAt(0).toLowerCase() + model.slice(1, -3)

            // @ts-expect-error temp
            this[name] = modelObject

            models.push(modelObject)
        })

        return models
    }

    loadAssociations(models: any[]) {
        for (const model of models) {
            if (model.associate) {
                model.associate(this)
            }
        }
    }

    async getUserByUsername(username: string) {
        if (this.usernameRegex.test(username)) {
            return null
        }

        return this.findOne('users', {
            where: { username }
        })
    }

    async getUserById(userId: number) {
        return this.findOne('users', {
            where: { id: userId }
        })
    }

    async getUsername(userId: number) {
        return this.findOne('users', {
            where: { id: userId },
            attributes: ['username'],
            raw: true

        }, null, result => result.username)
    }

    async getBanCount(userId: number) {
        return this.bans.count({
            where: { userId }
        })
    }

    async getIgloo(userId: number) {
        return this.findOne('igloos', {
            where: { userId },
            raw: true

        }, null, async result => {
            // Add furniture to igloo object
            result.furniture = await this.getFurnitures(userId)
            return result
        })
    }

    async getFurnitures(userId: number) {
        return this.findAll('furnitures', {
            where: { userId },
            raw: true

        }, [], result => result.map(({ id, userId, ...furniture }: any) => furniture))
    }

    async getPets(userId: number) {
        return this.findAll('pets', {
            where: { userId }
        })
    }

    async getWorldPopulations() {
        return this.getCrumb('worlds')
    }

    async getIgnored(userId: number, ignoreId: number) {
        return this.findOne('ignores', {
            where: { userId, ignoreId }
        })
    }

    async getPostcardsCount(userId: number) {
        return this.postcards.count({
            where: { userId }
        })
    }

    /*========== Helper functions ==========*/

    findOne(table: string, options: FindOptions = {}, emptyReturn: any = null, callback: FindCallback = null) {
        return this.find('findOne', table, options, emptyReturn, callback)
    }

    findAll(table: string, options: FindOptions = {}, emptyReturn: any = null, callback: FindCallback = null) {
        return this.find('findAll', table, options, emptyReturn, callback)
    }

    find(find: string, table: string, options: FindOptions, emptyReturn: any = null, callback: FindCallback = null) {
        // @ts-expect-error temp
        return this[table][find](options).then((result: any) => {

            if (callback && result) {
                return callback(result)
            } else if (result) {
                return result
            } else {
                return emptyReturn
            }
        })
    }

    async getCrumb(table: string) {
        return this.findAll(table, {
            raw: true

        }, {}, result => this.arrayToObject(result, 'id'))
    }

    arrayToObject(array: any[], key: string, value: string | null = null) {
        return array.reduce((obj, item) => {
            // If a value is passed in then the key will be mapped to item[value]
            const result = value ? item[value] : item

            obj[item[key]] = result
            delete item[key]

            return obj
        }, {})
    }

}
