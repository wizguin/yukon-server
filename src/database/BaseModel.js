import Sequelize from 'sequelize'


export default class BaseModel extends Sequelize.Model {

    protectedAttributes = []

    toJSON() {
        let attributes = this.get()

        for (let attribute of this.protectedAttributes) {
            delete attributes[attribute]
        }

        return attributes
    }

}
