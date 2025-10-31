import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'

export default class Cards extends BaseModel {

    declare userId: number
    declare cardId: number
    declare quantity: number
    declare memberQuantity: number

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                cardId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                memberQuantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'cards' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
