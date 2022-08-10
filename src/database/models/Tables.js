import Sequelize from 'sequelize'


export default class Tables extends Sequelize.Model {

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
                game: {
                    type: DataTypes.STRING(20),
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'tables' }
        )
    }

}
