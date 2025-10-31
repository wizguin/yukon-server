import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'

export default class FurnitureInventories extends BaseModel {

    declare userId: number
    declare itemId: number
    declare quantity: number

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
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'furniture_inventories' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
