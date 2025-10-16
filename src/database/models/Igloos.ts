import BaseModel from '../BaseModel'


export default class Igloos extends BaseModel {

    static init(sequelize, DataTypes) {
        return super.init(
            {
                userId: {
                    type: DataTypes.INTEGER(11),
                    allowNull: false,
                    primaryKey: true
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
            { sequelize, timestamps: false, tableName: 'igloos' }
        )
    }

    static associate({ users }) {
        this.belongsTo(users, {
            foreignKey: 'userId'
        })
    }

}
