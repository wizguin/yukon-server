import BaseModel from '../BaseModel'


export default class Worlds extends BaseModel {

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
