import BaseModel from '../BaseModel'

import pick from '@utils/pick'

import Sequelize from 'sequelize'


export default class Users extends BaseModel {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                username: {
                    type: DataTypes.STRING(12),
                    allowNull: false
                },
                password: {
                    type: DataTypes.STRING(60),
                    allowNull: false
                },
                loginKey: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                rank: {
                    type: DataTypes.INTEGER(1),
                    allowNull: false,
                    defaultValue: 1
                },
                permaBan: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: 0
                },
                joinTime: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
                },
                coins: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 500
                },
                head: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                face: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                neck: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                body: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                hand: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                feet: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                color: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 1
                },
                photo: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                },
                flag: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    defaultValue: 0
                }
            },
            { sequelize, timestamps: false, tableName: 'users' }
        )
    }

    static associate(db) {
        this.hasOne(db.authTokens, {
            foreignKey: 'userId',
            as: 'authToken'
        })
        this.hasOne(db.bans, {
            foreignKey: 'userId',
            as: 'ban'
        })
        this.hasMany(db.buddies, {
            foreignKey: 'userId',
            as: 'buddies'
        })
        this.belongsTo(db.buddies, {
            foreignKey: 'id'
        })
        this.hasMany(db.ignores, {
            foreignKey: 'userId',
            as: 'ignores'
        })
        this.belongsTo(db.ignores, {
            foreignKey: 'id'
        })
        this.hasMany(db.inventories, {
            foreignKey: 'userId',
            as: 'inventory'
        })
        this.hasMany(db.iglooInventories, {
            foreignKey: 'userId',
            as: 'igloos'
        })
        this.hasMany(db.furnitureInventories, {
            foreignKey: 'userId',
            as: 'furniture'
        })
    }

    get anonymous() {
        return pick(this,
            'id',
            'username',
            'head',
            'face',
            'neck',
            'body',
            'hand',
            'feet',
            'color',
            'photo',
            'flag',
        )
    }

}
