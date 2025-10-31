import BaseModel from '../BaseModel'

import type Database from '@database/Database'
import pick from '@utils/pick'

import type AuthTokens from './AuthTokens'
import type Bans from './Bans'
import type Buddies from './Buddies'
import type Cards from './Cards'
import type FurnitureInventories from './FurnitureInventories'
import type IglooInventories from './IglooInventories'
import type Ignores from './Ignores'
import type Inventories from './Inventories'
import type Pets from './Pets'
import type Postcards from './Postcards'

import Sequelize from 'sequelize'

export default class Users extends BaseModel {

    declare id: number
    declare username: string
    declare password: string
    declare loginKey: string | null
    declare rank: number
    declare permaBan: boolean
    declare joinTime: number
    declare coins: number
    declare head: number
    declare face: number
    declare neck: number
    declare body: number
    declare hand: number
    declare feet: number
    declare color: number
    declare photo: number
    declare flag: number
    declare ninjaRank: number
    declare ninjaProgress: number

    declare authToken: AuthTokens
    declare ban: Bans
    declare buddies: Buddies[]
    declare ignores: Ignores[]
    declare inventory: Inventories[]
    declare igloos: IglooInventories[]
    declare furniture: FurnitureInventories[]
    declare cards: Cards[]
    declare postcards: Postcards[]
    declare pets: Pets[]

    static initModel(sequelize: Sequelize.Sequelize) {
        return Users.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                username: {
                    type: Sequelize.STRING(12),
                    allowNull: false
                },
                password: {
                    type: Sequelize.STRING(60),
                    allowNull: false
                },
                loginKey: {
                    type: Sequelize.TEXT,
                    allowNull: true
                },
                rank: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 1
                },
                permaBan: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                joinTime: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
                },
                coins: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 500
                },
                head: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                face: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                neck: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                body: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                hand: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                feet: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                color: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 1
                },
                photo: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                flag: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                ninjaRank: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                ninjaProgress: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                }
            },
            { sequelize, timestamps: false, tableName: 'users' }
        )
    }

    static associate(db: Database) {
        this.hasOne(db.authTokens, {
            foreignKey: 'userId',
            as: 'authToken'
        })
        this.hasOne(db.bans, {
            foreignKey: 'userId',
            as: 'ban'
        })
        this.hasMany(db.buddies, {
            foreignKey: 'userId',
            as: 'buddies'
        })
        this.belongsTo(db.buddies, {
            foreignKey: 'id'
        })
        this.hasMany(db.ignores, {
            foreignKey: 'userId',
            as: 'ignores'
        })
        this.belongsTo(db.ignores, {
            foreignKey: 'id'
        })
        this.hasMany(db.inventories, {
            foreignKey: 'userId',
            as: 'inventory'
        })
        this.hasMany(db.iglooInventories, {
            foreignKey: 'userId',
            as: 'igloos'
        })
        this.hasMany(db.furnitureInventories, {
            foreignKey: 'userId',
            as: 'furniture'
        })
        this.hasMany(db.cards, {
            foreignKey: 'userId',
            as: 'cards'
        })
        this.hasMany(db.postcards, {
            foreignKey: 'userId',
            as: 'postcards'
        })
        this.hasMany(db.pets, {
            foreignKey: 'userId',
            as: 'pets'
        })
    }

    get anonymous() {
        return pick(this,
            'id',
            'username',
            'head',
            'face',
            'neck',
            'body',
            'hand',
            'feet',
            'color',
            'photo',
            'flag'
        )
    }

}
