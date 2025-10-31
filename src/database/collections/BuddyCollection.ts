import Collection from '../Collection'

import type GameUser from '@objects/user/GameUser'

export default class BuddyCollection extends Collection {

    usersById: Record<number, GameUser>

    constructor(user: GameUser, models: any[]) {
        super(user, models, 'buddies', 'buddyId')

        // @ts-expect-error temp
        this.usersById = this.handler.usersById
    }

    add(id: number) {
        super.add({ userId: this.user.id, buddyId: id })
    }

    isOnline(id: any) {
        return id in this.usersById
    }

    sendOnline(id: any) {
        const user = this.usersById[id]

        user.send('buddy_online', { id: this.user.id })
    }

    sendOffline() {
        for (const buddy in this.collection) {
            if (this.isOnline(buddy)) {
                // @ts-expect-error temp
                const user = this.usersById[buddy]

                user.send('buddy_offline', { id: this.user.id })
            }
        }
    }

    toJSON() {
        const buddies = []

        for (const buddy in this.collection) {
            const online = this.isOnline(buddy)
            const username = this.collection[buddy].user.username

            buddies.push({ id: parseInt(buddy), username, online })

            if (online) {
                this.sendOnline(buddy)
            }
        }

        return buddies
    }

}
