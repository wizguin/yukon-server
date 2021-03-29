import Sequelize from 'sequelize'


export default class UserFurnitures extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                iglooId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                furnitureId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                x: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false,
                    primaryKey: true
                },
                y: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false,
                    primaryKey: true
                },
                rotation: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false,
                    primaryKey: true
                },
                frame: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'user_furnitures' }
        )
    }

}
