import BaseModel from '../BaseModel'

import type Database from '@database/Database'
import type User from '@objects/user/User'

import Sequelize from 'sequelize'


export default class Ignores extends BaseModel {

    declare userId: number
    declare ignoreId: number

    declare user: User

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                ignoreId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'ignores' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
        this.hasOne(users, {
            foreignKey: 'id',
            sourceKey: 'ignoreId',
            as: 'user'
        })
    }

}
