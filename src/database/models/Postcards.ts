import BaseModel from '../BaseModel'

import type Database from '@database/Database'
import type Users from './Users'
import pick from '@utils/pick'

import Sequelize from 'sequelize'

const systemName = 'sys'

export default class Postcards extends BaseModel {

    declare id: number
    declare userId: number
    declare senderId: number
    declare postcardId: number
    declare sendDate: number
    declare details: string
    declare hasRead: boolean
    declare senderName: string

    declare user: Users

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                senderId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                postcardId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                sendDate: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                },
                details: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                    defaultValue: null
                },
                hasRead: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: 0
                },
                senderName: {
                    type: Sequelize.VIRTUAL,
                    get() {
                        return (this as Postcards).user?.username
                    }
                }
            },
            { sequelize, timestamps: false, tableName: 'postcards' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
        this.hasOne(users, {
            foreignKey: 'id',
            sourceKey: 'senderId',
            as: 'user'
        })
    }

    toJSON() {
        const postcard = pick(this,
            'id',
            'senderId',
            'postcardId',
            'sendDate',
            'details',
            'hasRead'
        )

        postcard.senderName = this.senderId !== null ? this.senderName : systemName

        return postcard
    }

}
