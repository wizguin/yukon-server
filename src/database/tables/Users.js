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
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                password: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                loginKey: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                rank: {
                    type: DataTypes.INTEGER(1),
                    allowNull: false
                },
                banned: {
                    type: DataTypes.INTEGER(1),
                    allowNull: false
                },
                coins: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false
                },
                buddies: {
                    type: DataTypes.TEXT,
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
                },
            },
            { sequelize, timestamps: false }
        )
    }

}
