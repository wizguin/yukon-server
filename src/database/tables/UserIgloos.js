import Sequelize from 'sequelize'


export default class UserIgloos extends Sequelize.Model {

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
                type: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                flooring: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                music: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                location: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                locked: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'user_igloos' }
        )
    }

}
