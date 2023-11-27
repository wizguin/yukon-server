import Collection from '../Collection'


export default class PostcardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'postcards', 'id')
    }

    add(id) {

    }

    toJSON() {
        return Object.values(this.collection)
    }

}
