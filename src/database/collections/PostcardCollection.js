import Collection from '../Collection'


export default class PostcardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'postcards', 'id')
    }

    async add(senderId, postcardId) {
        try {
            const model = await this.model.create({
                userId: this.user.id,
                senderId: senderId,
                postcardId: postcardId
            })

            await model.reload({
                include: {
                    model: this.db.users,
                    as: 'user',
                    attributes: ['username']
                }
            })

            this.collection[model[this.indexKey]] = model

            return model

        } catch (error) {
            this.handler.error(error)
        }

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
