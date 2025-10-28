import BaseModel from '../BaseModel'

import type Database from '@database/Database'
import type Users from './Users'

import Sequelize from 'sequelize'


export default class Buddies extends BaseModel {

    declare userId: number
    declare buddyId: number

    declare user: Users

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                buddyId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'buddies' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
        this.hasOne(users, {
            foreignKey: 'id',
            sourceKey: 'buddyId',
            as: 'user'
        })
    }

}
