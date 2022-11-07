import BaseModel from '../BaseModel'


export default class Buddies extends BaseModel {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                buddyId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'buddies' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
        this.hasOne(users, {
            foreignKey: 'id',
            sourceKey: 'buddyId',
            as: 'user'
        })
    }

}
