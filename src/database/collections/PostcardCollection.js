import Collection from '../Collection'


export default class PostcardCollection extends Collection {

    constructor(user, models) {
        super(user, models, 'postcards', 'id')
    }

    async add(senderId, postcardId, details = null, date = new Date()) {
        try {
            const model = await this.model.create({
                userId: this.user.id,
                senderId: senderId,
                postcardId: postcardId,
                sendDate: date,
                details: details
            })

            await model.reload({
                include: {
                    model: this.db.users,
                    as: 'user',
                    attributes: ['username']
                }
            })

            this.addModel(model)

            return model

        } catch (error) {
            this.handler.error(error)
        }

    }

    async removeFrom(senderId) {
        // Delete query
        await this.model.destroy({ where: { userId: this.user.id, senderId: senderId } })

        // Clear from collection
        for (const key in this.collection) {
            if (this.collection[key].senderId === senderId) {
                delete this.collection[key]
            }
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
        return this.values
    }

}
