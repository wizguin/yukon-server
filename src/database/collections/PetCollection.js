import Collection from '../Collection'


export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')
    }

    add(petId, name) {
        super.add({ userId: this.user.id, petId: petId, name: name })
    }

    toJSON() {
        return Object.values(this.collection)
    }

}
