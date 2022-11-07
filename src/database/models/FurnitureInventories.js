import BaseModel from '../BaseModel'


export default class FurnitureInventories extends BaseModel {

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
                },
                quantity: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                }
            },
            { sequelize, timestamps: false, tableName: 'furniture_inventories' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
