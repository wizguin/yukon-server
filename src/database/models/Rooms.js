import Sequelize from 'sequelize'


export default class Rooms extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING(50),
                    allowNull: false
                },
                member: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                },
                maxUsers: {
                    type: DataTypes.INTEGER(6),
                    allowNull: false
                },
                game: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                },
                spawn: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                },
                find: {
                    type: DataTypes.STRING(50),
                    allowNull: false
                }
            },
            { sequelize, timestamps: false, tableName: 'rooms' }
        )
    }

}
