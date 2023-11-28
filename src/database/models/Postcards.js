import BaseModel from '../BaseModel'

import pick from '@utils/pick'

import Sequelize from 'sequelize'


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
                    allowNull: false
                },
                postcardId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                sendDate: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
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
        return pick(this,
            'senderId',
            'senderName',
            'postcardId',
            'sendDate',
            'details',
            'hasRead'
        )
    }

}
