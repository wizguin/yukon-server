import Sequelize from 'sequelize'


export default class Waddles extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                roomId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                seats: {
                    type: DataTypes.INTEGER(1),
                    allowNull: false
                },
                game: {
                    type: DataTypes.STRING(20),
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'waddles' }
        )
    }

}
