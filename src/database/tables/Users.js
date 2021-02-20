import Sequelize from 'sequelize'


export default class Users extends Sequelize.Model {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true
                },
                username: {
                    type: DataTypes.STRING(12),
                    allowNull: false
                },
                password: {
                    type: DataTypes.STRING(60),
                    allowNull: false
                },
                loginKey: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                rank: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                },
                banned: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false
                },
                coins: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                head: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                face: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                neck: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                body: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                hand: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                feet: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                color: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                photo: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                flag: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                }
            },
            { sequelize, timestamps: false }
        )
    }

}
