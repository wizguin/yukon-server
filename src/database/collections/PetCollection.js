import Collection from '../Collection'


export default class PetCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'pets', 'id')
    }

    add(petId, name) {
        super.add({ petId: petId, name: name })
    }

}
