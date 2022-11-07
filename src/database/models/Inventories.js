import BaseModel from '../BaseModel'


export default class Inventories extends BaseModel {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                itemId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'inventories' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
