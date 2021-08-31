import Sequelize from 'sequelize'


export default class Buddies extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                },
                buddyId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
                }
            },
            { sequelize, timestamps: false, tableName: 'buddies' }
        )
    }

}
