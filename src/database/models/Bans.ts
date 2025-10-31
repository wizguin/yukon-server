import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'

export default class Bans extends BaseModel {

    protectedAttributes = ['id', 'moderatorId', 'message']

    declare id: number
    declare userId: number
    declare issued: number
    declare expires: number
    declare moderatorId: number
    declare message: string

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
                issued: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
                },
                expires: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                moderatorId: {
                    type: Sequelize.INTEGER,
                    allowNull: true
                },
                message: {
                    type: Sequelize.STRING(60),
                    allowNull: true
                }
            },
            { sequelize, timestamps: false, tableName: 'bans' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
