import Collection from '../Collection'

import type GameUser from '@objects/user/GameUser'


export default class PostcardCollection extends Collection {

    constructor(user: GameUser, models: any[]) {
        super(user, models, 'postcards', 'id')
    }

    // @ts-expect-error temp
    async add(senderId: number, postcardId: number, details: any = null) {
        try {
            const model = await this.model.create({
                userId: this.user.id,
                senderId: senderId,
                postcardId: postcardId,
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
            if (error instanceof Error) {
                this.handler.error(error)
            }
        }

    }

    async removeFrom(senderId: number) {
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
