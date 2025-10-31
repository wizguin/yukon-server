import { Model } from 'sequelize'

export default abstract class BaseModel extends Model {

    protectedAttributes: string[] = []

    toJSON() {
        const attributes = this.get()

        for (const attribute of this.protectedAttributes) {
            delete attributes[attribute]
        }

        return attributes
    }

}
