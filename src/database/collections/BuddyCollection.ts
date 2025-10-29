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
        let user = this.usersById[id]

        user.send('buddy_online', { id: this.user.id })
    }

    sendOffline() {
        for (let buddy in this.collection) {
            if (this.isOnline(buddy)) {
                // @ts-expect-error temp
                let user = this.usersById[buddy]

                user.send('buddy_offline', { id: this.user.id })
            }
        }
    }

    toJSON() {
        let buddies = []

        for (let buddy in this.collection) {
            let online = this.isOnline(buddy)
            let username = this.collection[buddy].user.username

            buddies.push({ id: parseInt(buddy), username: username, online: online })

            if (online) {
                this.sendOnline(buddy)
            }
        }

        return buddies
    }

}
