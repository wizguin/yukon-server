import BaseModel from '../BaseModel'

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
                    allowNull: false
                },
                permaBan: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                },
                joinTime: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
                },
                coins: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                head: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                face: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                neck: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                body: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                hand: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                feet: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                color: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                photo: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                flag: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
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

}
