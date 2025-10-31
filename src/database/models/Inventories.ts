import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'

export default class Inventories extends BaseModel {

    declare userId: number
    declare itemId: number

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                itemId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'inventories' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
