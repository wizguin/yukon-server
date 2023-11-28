import Collection from '../Collection'


export default class PostcardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'postcards', 'id')
    }

    add(senderId, postcardId) {
        super.add({
            userId: this.user.id,
            senderId: senderId,
            postcardId: postcardId
        })
    }

    readMail() {
        for (const key in this.collection) {
            const postcard = this.collection[key]

            if (!postcard.hasRead) {
                postcard.update({ hasRead: true })
            }
        }
    }

    toJSON() {
        return Object.values(this.collection)
    }

}
