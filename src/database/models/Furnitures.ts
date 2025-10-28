import BaseModel from '../BaseModel'

import type Database from '@database/Database'

import Sequelize from 'sequelize'


export default class Furnitures extends BaseModel {

    declare id: number
    declare userId: number
    declare furnitureId: number
    declare x: number
    declare y: number
    declare rotation: number
    declare frame: number

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
                furnitureId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                x: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                y: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                rotation: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                frame: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'furnitures' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
