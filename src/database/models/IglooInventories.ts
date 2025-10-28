import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'


export default class IglooInventories extends BaseModel {

    declare userId: number
    declare iglooId: number

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                iglooId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'igloo_inventories' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
