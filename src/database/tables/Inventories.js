import Sequelize from 'sequelize'


export default class Inventories extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                itemId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                }
            },
            { sequelize, timestamps: false }
        )
    }

}
