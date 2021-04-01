import Sequelize from 'sequelize'


export default class UserFurnitures extends Sequelize.Model {

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
                furnitureId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                x: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false
                },
                y: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false
                },
                rotation: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false
                },
                frame: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'user_furnitures' }
        )
    }

}
