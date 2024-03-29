import BaseModel from '../BaseModel'

import { clamp } from '@utils/math'
import pick from '@utils/pick'

import Sequelize from 'sequelize'


export default class Pets extends BaseModel {

    x = 0
    y = 0

    walking = false

    get hungry() {
        return this.energy < 10
    }

    get dead() {
        return this.energy === 0 || this.health === 0 || this.rest === 0
    }

    get happiness() {
        const statTotal = this.energy + this.health + this.rest

        return Math.round((statTotal / 300) * 100)
    }

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
                typeId: {
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
                },
                feedPostcardId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: true,
                    defaultValue: null
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

    updateStats(updates) {
        // Apply current  stats
        for (const stat in updates) {
            updates[stat] = clamp(this[stat] + updates[stat], 0, 100)
        }

        this.update(updates)
    }

    toJSON() {
        return pick(this,
            'id',
            'typeId',
            'name',
            'energy',
            'health',
            'rest',
            'x',
            'y',
            'walking'
        )
    }

}
