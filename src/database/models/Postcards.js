import BaseModel from '../BaseModel'

import pick from '@utils/pick'

import Sequelize from 'sequelize'


const systemName = 'sys'

export default class Postcards extends BaseModel {

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
                senderId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: true
                },
                postcardId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                sendDate: {
                    type: Sequelize.DATE(3),
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                details: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    defaultValue: null
                },
                hasRead: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: 0
                },
                senderName: {
                    type: DataTypes.VIRTUAL,
                    get() {
                        return this.user?.username
                    }
                }
            },
            { sequelize, timestamps: false, tableName: 'postcards' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
        this.hasOne(users, {
            foreignKey: 'id',
            sourceKey: 'senderId',
            as: 'user'
        })
    }

    toJSON() {
        const postcard = pick(this,
            'id',
            'senderId',
            'postcardId',
            'sendDate',
            'details',
            'hasRead'
        )

        postcard.senderName = this.senderId !== null ? this.senderName : systemName

        return postcard
    }

}
