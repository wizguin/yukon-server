import Collection from '../Collection'


export default class PostcardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'postcards', 'id')
    }

    add(id) {

    }

    readMail() {
        for (const postcard in this.collection) {
            this.collection[postcard].update({ hasRead: true })
        }
    }

    toJSON() {
        return Object.values(this.collection)
    }

}
