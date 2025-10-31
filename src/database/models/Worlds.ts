import BaseModel from '../BaseModel'

import Sequelize from 'sequelize'

export default class Worlds extends BaseModel {

    declare id: string
    declare population: number

    static initModel(sequelize: Sequelize.Sequelize) {
        return super.init(
            {
                id: {
                    type: Sequelize.STRING(3),
                    allowNull: false,
                    primaryKey: true
                },
                population: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                }
            },
            { sequelize, timestamps: false, tableName: 'worlds' }
        )
    }

}
