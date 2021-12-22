import Sequelize from 'sequelize'


export default class Worlds extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.STRING(3),
                    allowNull: false,
                    primaryKey: true
                },
                population: {
                    type: DataTypes.INTEGER(3),
                    allowNull: false,
                    defaultvalue: 0
                }
            },
            { sequelize, timestamps: false, tableName: 'worlds' }
        )
    }

}
