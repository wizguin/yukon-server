import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'

export default class AuthTokens extends BaseModel {

    declare userId: number
    declare selector: string
    declare validator: string
    declare timestamp: number

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                selector: {
                    type: Sequelize.STRING(36),
                    allowNull: false,
                    primaryKey: true
                },
                validator: {
                    type: Sequelize.STRING(60),
                    allowNull: false
                },
                timestamp: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
                }
            },
            { sequelize, timestamps: false, tableName: 'auth_tokens' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
