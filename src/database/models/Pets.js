import BaseModel from '../BaseModel'

import pick from '@utils/pick'

import Sequelize from 'sequelize'


export default class Pets extends BaseModel {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                petId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                name: {
                    type: DataTypes.STRING(12),
                    allowNull: false,
                },
                adoptionDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                energy: {
                    type: DataTypes.INTEGER(3),
                    allowNull: false,
                    defaultValue: 100
                },
                health: {
                    type: DataTypes.INTEGER(3),
                    allowNull: false,
                    defaultValue: 100
                },
                rest: {
                    type: DataTypes.INTEGER(3),
                    allowNull: false,
                    defaultValue: 100
                }
            },
            { sequelize, timestamps: false, tableName: 'pets' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

    toJSON() {
        return pick(this,
            'id',
            'petId',
            'name',
            'energy',
            'health',
            'rest'
        )
    }

}
