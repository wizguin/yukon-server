import Sequelize from 'sequelize'


export default class Bans extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                issued: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
                },
                expires: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    primaryKey: true
                },
                moderatorId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: true
                },
                message: {
                    type: DataTypes.STRING(60),
                    allowNull: true
                }
            },
            { sequelize, timestamps: false, tableName: 'bans' }
        )
    }

}
