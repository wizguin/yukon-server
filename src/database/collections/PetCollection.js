import Collection from '../Collection'


export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')

        this.adoptPostcard = 111
    }

    async add(petId, name) {
        try {
            const model = await this.model.create({ userId: this.user.id, petId: petId, name: name })

            this.collection[model[this.indexKey]] = model

            this.user.addSystemMail(111)

        } catch (error) {
            this.handler.error(error)
        }
    }

    toJSON() {
        return Object.values(this.collection)
    }

}
