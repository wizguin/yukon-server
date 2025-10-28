import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'


export default class Igloos extends BaseModel {

    declare userId: number
    declare type: number
    declare flooring: number
    declare music: number
    declare location: number
    declare locked: boolean

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true
                },
                type: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                flooring: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                music: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                location: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                locked: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'igloos' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
