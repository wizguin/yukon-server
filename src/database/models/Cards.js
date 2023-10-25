import BaseModel from '../BaseModel'


export default class Cards extends BaseModel {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                cardId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                quantity: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                },
                memberQuantity: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                }
            },
            { sequelize, timestamps: false, tableName: 'cards' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
