import BaseModel from '../BaseModel'

import { clamp } from '@utils/math'
import type Database from '@database/Database'
import pick from '@utils/pick'

import Sequelize from 'sequelize'


export default class Pets extends BaseModel {

    declare id: number
    declare userId: number
    declare typeId: number
    declare name: string
    declare adoptionDate: number
    declare energy: number
    declare health: number
    declare rest: number
    declare feedPostcardId: number

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
                typeId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                name: {
                    type: Sequelize.STRING(12),
                    allowNull: false,
                },
                adoptionDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW
                },
                energy: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 100
                },
                health: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 100
                },
                rest: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 100
                },
                feedPostcardId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    defaultValue: null
                }
            },
            { sequelize, timestamps: false, tableName: 'pets' }
        )
    }

    static associate({ users }: Database) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

    updateStats(updates: any) {
        // Apply current  stats
        for (const stat in updates) {
            // @ts-expect-error temp
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
